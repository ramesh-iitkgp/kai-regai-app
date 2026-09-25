/**
 * Kai RegAI — Session Token & Cryptographic Hash Service
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * - Generates cryptographically secure 256-bit bearer tokens
 * - Never persists raw session tokens: stores only SHA-256 token digests in database
 * - Validates session lifespan, revocation, and active state
 */

import { randomBytes, createHash } from 'node:crypto';

export class TokenService {
  /**
   * Generate raw bearer token
   * @returns {string} 64-char hex string
   */
  static generateToken() {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash raw token with SHA-256 for persistent database matching
   * @param {string} token 
   * @returns {string}
   */
  static hashToken(token) {
    if (!token || typeof token !== 'string') return '';
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Calculate future expiration timestamp
   * @param {number} [ttlSeconds=2592000] 30 days default
   * @returns {string} ISO timestamp
   */
  static calculateExpiry(ttlSeconds = 30 * 24 * 60 * 60) {
    return new Date(Date.now() + ttlSeconds * 1000).toISOString();
  }

  /**
   * Verify if a session record is currently valid
   * @param {Object} sessionRow
   * @param {Date|string} [asOfTime]
   * @returns {boolean}
   */
  static isSessionValid(sessionRow, asOfTime = new Date()) {
    if (!sessionRow) return false;
    if (sessionRow.revoked_at) return false;
    const now = new Date(asOfTime).getTime();
    const expiry = new Date(sessionRow.expires_at).getTime();
    return now < expiry;
  }
}
