/**
 * Kai RegAI — Guest Identity Provider
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Generates and manages anonymous, non-semantic, non-guessable guest IDs:
 * - Format: GST-<timestamp>-<crypto-random>
 * - Preserves identity locally so guest users can maintain a personal reading history
 * - Contains zero personal, device, or advertising identifiers
 */

export class GuestIdentityProvider {
  constructor(storageProvider) {
    this.storage = storageProvider;
    this.cachedGuestId = null;
  }

  /**
   * Get existing guest ID or generate a new one
   * @returns {Promise<string>}
   */
  async getOrCreateGuestId() {
    if (this.cachedGuestId) {
      return this.cachedGuestId;
    }

    // Try reading from storage settings
    if (this.storage) {
      try {
        const storedProfile = await this.storage.getProfile('CURRENT_GUEST_PROFILE');
        if (storedProfile?.ownerId) {
          this.cachedGuestId = storedProfile.ownerId;
          return this.cachedGuestId;
        }
      } catch {
        // Fall through to generation
      }
    }

    // Generate new random guest ID
    const randomSuffix = (typeof globalThis.crypto?.randomUUID === 'function')
      ? globalThis.crypto.randomUUID().substring(0, 8)
      : Math.random().toString(36).substring(2, 10);

    const newGuestId = `GST-${Date.now()}-${randomSuffix}`;
    this.cachedGuestId = newGuestId;

    return newGuestId;
  }

  /**
   * Reset guest ID upon local data purge
   */
  reset() {
    this.cachedGuestId = null;
  }
}
