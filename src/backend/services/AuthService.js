/**
 * Kai RegAI — Server-Side Authentication & Session Management
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * - Full support for Guest (`GST-...`) and Authenticated Account (`USR-...`) identities
 * - SHA-256 hashed session token storage
 * - Atomic guest-to-account ownership migration
 * - Non-destructive account lifecycle controls
 */

import { randomUUID } from 'node:crypto';
import { TokenService } from '../security/TokenService.js';

export class AuthService {
  constructor(database, auditService) {
    this.database = database;
    this.auditService = auditService;
  }

  /**
   * Initialize or resume an anonymous guest session
   * @param {Object} [options]
   * @returns {{ user: Object, session: Object, token: string }}
   */
  createGuestSession(options = {}) {
    const userId = options.guestId || `GST-${Date.now()}-${randomUUID().substring(0, 6).toUpperCase()}`;
    const rawToken = TokenService.generateToken();
    const tokenHash = TokenService.hashToken(rawToken);
    const expiresAt = TokenService.calculateExpiry();
    const now = new Date().toISOString();

    return this.database.transaction((db) => {
      // 1. Upsert guest user
      const existingUser = db.prepare('SELECT * FROM users WHERE user_id = ?;').get(userId);
      if (!existingUser) {
        db.prepare(`
          INSERT INTO users (user_id, owner_type, email, display_name, metadata, created_at, updated_at)
          VALUES (?, 'GUEST', NULL, 'Anonymous Seeker', '{}', ?, ?);
        `).run(userId, now, now);
      }

      // 2. Insert session
      const sessionId = `SES-${Date.now()}-${randomUUID().substring(0, 8)}`;
      db.prepare(`
        INSERT INTO sessions (session_id, token_hash, user_id, expires_at, revoked_at, client_ip, created_at)
        VALUES (?, ?, ?, ?, NULL, ?, ?);
      `).run(sessionId, tokenHash, userId, expiresAt, options.clientIp || null, now);

      this.auditService?.logEvent({
        eventType: 'ACCOUNT_CREATED',
        actorId: userId,
        resourceId: sessionId,
        details: { ownerType: 'GUEST' }
      });

      const user = db.prepare('SELECT * FROM users WHERE user_id = ?;').get(userId);
      const session = db.prepare('SELECT * FROM sessions WHERE session_id = ?;').get(sessionId);

      const normalizedUser = {
        userId: user.user_id,
        user_id: user.user_id,
        ownerId: user.user_id,
        ownerType: user.owner_type,
        email: user.email,
        displayName: user.display_name,
        metadata: JSON.parse(user.metadata || '{}'),
        createdAt: user.created_at
      };

      return {
        user: normalizedUser,
        session,
        sessionId: session.session_id,
        token: rawToken,
        expiresAt
      };
    });
  }

  /**
   * Authenticate a bearer token
   * @param {string} token 
   * @returns {{ user: Object, session: Object }|null}
   */
  authenticateSession(token) {
    if (!token || typeof token !== 'string') return null;
    const tokenHash = TokenService.hashToken(token);

    const row = this.database.prepare(`
      SELECT 
        s.session_id, s.token_hash, s.user_id, s.expires_at, s.revoked_at, s.created_at as session_created_at,
        u.owner_type, u.email, u.display_name, u.metadata as user_metadata, u.created_at as user_created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.token_hash = ?;
    `).get(tokenHash);

    if (!row) return null;

    if (!TokenService.isSessionValid(row)) {
      return null;
    }

    return {
      user: {
        userId: row.user_id,
        ownerType: row.owner_type,
        email: row.email,
        displayName: row.display_name,
        metadata: JSON.parse(row.user_metadata || '{}'),
        createdAt: row.user_created_at
      },
      session: {
        sessionId: row.session_id,
        expiresAt: row.expires_at,
        createdAt: row.session_created_at
      }
    };
  }

  /**
   * Atomically upgrade guest session to authenticated account
   * Reassigns all readings, transactions, entitlements, and sessions to the new user ID
   * @param {Object} params
   * @returns {Promise<{ user: Object, migratedReadings: number, migratedTransactions: number, migratedEntitlements: number }>}
   */
  upgradeGuestToAccount({ guestUserId, email, displayName = null, requestId = null }) {
    if (!guestUserId || !guestUserId.startsWith('GST-')) {
      throw new Error('Valid guestUserId starting with GST- required for account upgrade');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address required for account upgrade');
    }

    const newUserId = `USR-${Date.now()}-${randomUUID().substring(0, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    return this.database.transaction((db) => {
      // 1. Verify guest exists
      const guest = db.prepare('SELECT * FROM users WHERE user_id = ?;').get(guestUserId);
      if (!guest) {
        throw new Error(`Guest '${guestUserId}' not found`);
      }

      // Check if email already claimed
      const existingEmail = db.prepare('SELECT * FROM users WHERE email = ?;').get(email);
      if (existingEmail) {
        throw new Error(`Account with email '${email}' already exists`);
      }

      // 2. Create authenticated account user
      db.prepare(`
        INSERT INTO users (user_id, owner_type, email, display_name, metadata, created_at, updated_at)
        VALUES (?, 'ACCOUNT', ?, ?, ?, ?, ?);
      `).run(
        newUserId,
        email,
        displayName || email.split('@')[0],
        JSON.stringify({ upgradedFromGuestId: guestUserId, upgradedAt: now }),
        now,
        now
      );

      // 3. Migrate readings
      const readingsResult = db.prepare(`
        UPDATE readings 
        SET owner_id = ?, updated_at = ?
        WHERE owner_id = ?;
      `).run(newUserId, now, guestUserId);

      // 4. Migrate transactions
      const txnsResult = db.prepare(`
        UPDATE transactions 
        SET owner_id = ?
        WHERE owner_id = ?;
      `).run(newUserId, guestUserId);

      // 5. Migrate entitlements
      const entsResult = db.prepare(`
        UPDATE entitlements 
        SET owner_id = ?
        WHERE owner_id = ?;
      `).run(newUserId, guestUserId);

      // 6. Migrate active sessions
      db.prepare(`
        UPDATE sessions 
        SET user_id = ?
        WHERE user_id = ?;
      `).run(newUserId, guestUserId);

      // 7. Audit log
      this.auditService?.logEvent({
        eventType: 'ACCOUNT_MIGRATED',
        actorId: newUserId,
        resourceId: guestUserId,
        requestId,
        details: {
          guestId: guestUserId,
          accountId: newUserId,
          migratedReadings: readingsResult.changes,
          migratedTransactions: txnsResult.changes,
          migratedEntitlements: entsResult.changes
        }
      });

      const updatedUser = db.prepare('SELECT * FROM users WHERE user_id = ?;').get(newUserId);

      return {
        user: {
          userId: updatedUser.user_id,
          ownerType: updatedUser.owner_type,
          email: updatedUser.email,
          displayName: updatedUser.display_name,
          createdAt: updatedUser.created_at
        },
        migratedReadings: readingsResult.changes,
        migratedTransactions: txnsResult.changes,
        migratedEntitlements: entsResult.changes
      };
    });
  }

  /**
   * Validate session token and throw if invalid or expired
   * @param {string} token
   * @returns {{ user: Object, sessionId: string }}
   */
  validateSession(token) {
    if (!token) {
      throw new Error('401 Unauthorized: Session token missing or invalid');
    }

    const tokenHash = TokenService.hashToken(token);
    const row = this.database.prepare(`
      SELECT 
        s.session_id, s.token_hash, s.user_id, s.expires_at, s.revoked_at, s.created_at as session_created_at,
        u.owner_type, u.email, u.display_name, u.metadata as user_metadata, u.created_at as user_created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.token_hash = ?;
    `).get(tokenHash);

    if (!row) {
      throw new Error('401 Unauthorized: Session token not found');
    }

    if (row.revoked_at) {
      throw new Error('401 Unauthorized: Session has been revoked');
    }

    if (new Date(row.expires_at) <= new Date()) {
      throw new Error('401 Unauthorized: Session token has expired');
    }

    return {
      user: {
        userId: row.user_id,
        user_id: row.user_id,
        ownerId: row.user_id,
        ownerType: row.owner_type,
        email: row.email,
        displayName: row.display_name,
        metadata: JSON.parse(row.user_metadata || '{}'),
        createdAt: row.user_created_at
      },
      sessionId: row.session_id
    };
  }

  /**
   * Create or login user account
   */
  createOrLoginAccount({ email, displayName = null }, clientIp = '127.0.0.1', requestId = null) {
    if (!email || !email.includes('@')) {
      throw new Error('400 Bad Request: Valid email address required');
    }

    const now = new Date().toISOString();
    const rawToken = TokenService.generateToken();
    const tokenHash = TokenService.hashToken(rawToken);
    const expiresAt = TokenService.calculateExpiry();

    return this.database.transaction((db) => {
      let user = db.prepare('SELECT * FROM users WHERE email = ?;').get(email);
      let userId;

      if (!user) {
        userId = `USR-${Date.now()}-${randomUUID().substring(0, 6).toUpperCase()}`;
        db.prepare(`
          INSERT INTO users (user_id, owner_type, email, display_name, metadata, created_at, updated_at)
          VALUES (?, 'ACCOUNT', ?, ?, '{}', ?, ?);
        `).run(userId, email, displayName || email.split('@')[0], now, now);

        this.auditService?.logEvent({
          eventType: 'ACCOUNT_CREATED',
          actorId: userId,
          requestId,
          details: { ownerType: 'ACCOUNT', email }
        });
      } else {
        userId = user.user_id;
      }

      const sessionId = `SES-${Date.now()}-${randomUUID().substring(0, 8)}`;
      db.prepare(`
        INSERT INTO sessions (session_id, token_hash, user_id, expires_at, revoked_at, client_ip, created_at)
        VALUES (?, ?, ?, ?, NULL, ?, ?);
      `).run(sessionId, tokenHash, userId, expiresAt, clientIp, now);

      const dbUser = db.prepare('SELECT * FROM users WHERE user_id = ?;').get(userId);
      const normalizedUser = {
        userId: dbUser.user_id,
        user_id: dbUser.user_id,
        ownerId: dbUser.user_id,
        ownerType: dbUser.owner_type,
        email: dbUser.email,
        displayName: dbUser.display_name,
        metadata: JSON.parse(dbUser.metadata || '{}'),
        createdAt: dbUser.created_at
      };

      return {
        user: normalizedUser,
        sessionId,
        token: rawToken,
        expiresAt
      };
    });
  }

  /**
   * Revoke active session (Logout alias)
   */
  revokeSession(token, requestId = null) {
    const success = this.logout(token);
    if (success) {
      this.auditService?.logEvent({
        eventType: 'SESSION_REVOKED',
        requestId,
        details: { tokenHash: TokenService.hashToken(token).substring(0, 8) }
      });
    }
    return success;
  }

  /**
   * Safe guest migration to account
   */
  migrateGuestToAccount({ guestId, accountEmail, accountDisplayName = null, requesterId, clientIp = '127.0.0.1', requestId = null }) {
    if (!requesterId) {
      throw new Error('401 Unauthorized: Session token missing');
    }

    if (requesterId !== guestId) {
      this.auditService?.logEvent({
        eventType: 'UNAUTHORIZED_ACCESS',
        actorId: requesterId,
        resourceId: guestId,
        requestId,
        details: { reason: 'Guest migration takeover attempt' }
      });
      throw new Error('403 Forbidden: Ownership mismatch during guest migration');
    }

    return this.upgradeGuestToAccount({
      guestUserId: guestId,
      email: accountEmail,
      displayName: accountDisplayName,
      requestId
    });
  }

  /**
   * Revoke active session (Logout)
   * @param {string} token 
   * @returns {boolean}
   */
  logout(token) {
    if (!token) return false;
    const tokenHash = TokenService.hashToken(token);
    const now = new Date().toISOString();

    const res = this.database.prepare(`
      UPDATE sessions 
      SET revoked_at = ?
      WHERE token_hash = ? AND revoked_at IS NULL;
    `).run(now, tokenHash);

    return res.changes > 0;
  }
}
