/**
 * Kai RegAI — Mock Auth Provider & Guest Identity Manager
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Provides robust authentication abstractions for production web & test environments:
 * - Default anonymous Guest session with random non-semantic ID
 * - Seamless Guest-to-Account upgrade with automatic reading reassignment
 * - Isolated account switching preventing multi-user cross-contamination
 */

import { AuthProvider } from './AuthProvider.js';
import { UserProfile } from './UserProfile.js';
import { GuestIdentityProvider } from './GuestIdentityProvider.js';
import { OWNER_TYPE } from '../storage/ReadingSchema.js';

export class MockAuthProvider extends AuthProvider {
  constructor(storageProvider) {
    super();
    this.storage = storageProvider;
    this.guestProvider = new GuestIdentityProvider(storageProvider);
    this.currentUser = null;
  }

  async init() {
    // Attempt loading existing active profile from storage
    if (this.storage) {
      const stored = await this.storage.getProfile('CURRENT_ACTIVE_PROFILE');
      if (stored) {
        this.currentUser = new UserProfile(stored);
        return this.currentUser;
      }
    }

    // Default to initialized guest user
    const guestId = await this.guestProvider.getOrCreateGuestId();
    this.currentUser = new UserProfile({
      profileId: 'PRF-GUEST-DEFAULT',
      ownerId: guestId,
      ownerType: OWNER_TYPE.GUEST,
      displayName: 'Guest Seeker'
    });

    if (this.storage) {
      await this.storage.saveProfile({ ...this.currentUser.toJSON(), profileId: 'CURRENT_ACTIVE_PROFILE' });
    }

    return this.currentUser;
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      await this.init();
    }
    return this.currentUser;
  }

  isGuest() {
    return this.currentUser?.ownerType === OWNER_TYPE.GUEST;
  }

  /**
   * Upgrade guest session to authenticated account
   * Migrates all local readings owned by guest ID to the new account ID
   * @param {Object} accountData
   * @param {string} accountData.email
   * @param {string} [accountData.displayName]
   * @returns {Promise<UserProfile>}
   */
  async upgradeGuestToAccount({ email, displayName }) {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email required for account upgrade');
    }

    const previousGuestId = this.currentUser?.ownerId;
    const newAccountId = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 1. Reassign local readings
    if (this.storage && previousGuestId) {
      const { records } = await this.storage.listReadings({ ownerId: previousGuestId, limit: 1000 });
      for (const rec of records) {
        rec.ownerId = newAccountId;
        rec.ownerType = OWNER_TYPE.ACCOUNT;
        rec.updatedAt = new Date().toISOString();
        await this.storage.saveReading(rec);
      }

      // 1b. Reassign local entitlements & transactions
      if (typeof this.storage.listEntitlements === 'function') {
        const ents = await this.storage.listEntitlements({ ownerId: previousGuestId });
        for (const ent of ents) {
          ent.ownerId = newAccountId;
          await this.storage.saveEntitlement(ent);
        }
      }
      if (typeof this.storage.listTransactions === 'function') {
        const txns = await this.storage.listTransactions({ ownerId: previousGuestId });
        for (const txn of txns) {
          txn.ownerId = newAccountId;
          await this.storage.saveTransaction(txn);
        }
      }
    }

    // 2. Establish new authenticated profile
    this.currentUser = new UserProfile({
      profileId: `PRF-${newAccountId}`,
      ownerId: newAccountId,
      ownerType: OWNER_TYPE.ACCOUNT,
      displayName: displayName || email.split('@')[0],
      email,
      preferences: {
        ...this.currentUser?.preferences,
        cloudSyncEnabled: true
      },
      readingStats: this.currentUser?.readingStats
    });

    if (this.storage) {
      await this.storage.saveProfile({ ...this.currentUser.toJSON(), profileId: 'CURRENT_ACTIVE_PROFILE' });
    }

    return this.currentUser;
  }

  /**
   * Login with account credentials (mock simulation)
   */
  async login({ email, displayName }) {
    const accountId = `USR-${Math.abs(this.simpleHash(email))}`;
    this.currentUser = new UserProfile({
      profileId: `PRF-${accountId}`,
      ownerId: accountId,
      ownerType: OWNER_TYPE.ACCOUNT,
      displayName: displayName || email.split('@')[0],
      email,
      preferences: { cloudSyncEnabled: true }
    });

    if (this.storage) {
      await this.storage.saveProfile({ ...this.currentUser.toJSON(), profileId: 'CURRENT_ACTIVE_PROFILE' });
    }
    return this.currentUser;
  }

  /**
   * Logout and revert safely to fresh anonymous guest
   */
  async logout() {
    this.guestProvider.reset();
    const newGuestId = await this.guestProvider.getOrCreateGuestId();
    this.currentUser = new UserProfile({
      profileId: 'PRF-GUEST-DEFAULT',
      ownerId: newGuestId,
      ownerType: OWNER_TYPE.GUEST,
      displayName: 'Guest Seeker'
    });

    if (this.storage) {
      await this.storage.saveProfile({ ...this.currentUser.toJSON(), profileId: 'CURRENT_ACTIVE_PROFILE' });
    }
    return this.currentUser;
  }

  /**
   * Delete account and clear active session
   */
  async deleteAccount() {
    if (this.currentUser?.ownerType === OWNER_TYPE.ACCOUNT && this.storage) {
      // Purge account readings
      const { records } = await this.storage.listReadings({ ownerId: this.currentUser.ownerId, limit: 1000 });
      for (const rec of records) {
        await this.storage.deleteReading(rec.readingId);
      }
    }
    return this.logout();
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
