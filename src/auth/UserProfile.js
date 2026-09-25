/**
 * Kai RegAI — User Profile Model
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Manages user preferences, hand dominance, and reading statistics:
 * - Kept strictly separate from large reading record payloads
 * - Contains zero sensitive biometrics or private questionnaire answers
 */

export class UserProfile {
  constructor(data = {}) {
    this.profileId = data.profileId || `PRF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    this.ownerId = data.ownerId || 'GST-ANONYMOUS';
    this.ownerType = data.ownerType || 'GUEST';
    this.displayName = data.displayName || null;
    this.email = data.email || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || this.createdAt;

    this.preferences = {
      dominantHand: data.preferences?.dominantHand || 'RIGHT',
      theme: data.preferences?.theme || 'OBSIDIAN_GOLD',
      hapticsEnabled: data.preferences?.hapticsEnabled ?? true,
      cloudSyncEnabled: data.preferences?.cloudSyncEnabled ?? false,
      privacyMode: data.preferences?.privacyMode || 'EPHEMERAL_RAM'
    };

    this.readingStats = {
      totalScans: data.readingStats?.totalScans ?? 0,
      guidedDossiers: data.readingStats?.guidedDossiers ?? 0,
      lastReadingDate: data.readingStats?.lastReadingDate || null
    };
  }

  recordReadingCreated(readingMethod) {
    if (readingMethod === 'MODE_1_CAMERA' || readingMethod === 'MODE_1_SCANNER') {
      this.readingStats.totalScans += 1;
    } else {
      this.readingStats.guidedDossiers += 1;
    }
    this.readingStats.lastReadingDate = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      profileId: this.profileId,
      ownerId: this.ownerId,
      ownerType: this.ownerType,
      displayName: this.displayName,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      preferences: this.preferences,
      readingStats: this.readingStats
    };
  }
}
