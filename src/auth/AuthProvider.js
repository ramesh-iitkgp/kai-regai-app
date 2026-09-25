/**
 * Kai RegAI — Base Auth Provider Interface
 * Phase: P11 — Secure User, Session & Reading History Architecture
 */

export class AuthProvider {
  async init() {
    throw new Error('init() must be implemented');
  }

  async getCurrentUser() {
    throw new Error('getCurrentUser() must be implemented');
  }

  isGuest() {
    throw new Error('isGuest() must be implemented');
  }

  async upgradeGuestToAccount(accountData) {
    throw new Error('upgradeGuestToAccount() must be implemented');
  }

  async login(credentials) {
    throw new Error('login() must be implemented');
  }

  async logout() {
    throw new Error('logout() must be implemented');
  }

  async deleteAccount() {
    throw new Error('deleteAccount() must be implemented');
  }
}
