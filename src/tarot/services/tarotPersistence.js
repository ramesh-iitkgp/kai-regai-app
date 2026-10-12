/**
 * Kai RegAI — Tarot Persistence Service
 * 
 * Manages storage and retrieval of:
 * 1. Calendar-anchored Daily Tarot readings (stable per local calendar day)
 * 2. Complete Private Reading History (review past readings, delete actions)
 * 3. Re-opening historical readings with exact cards, orientations, and interpretations
 */

const STORAGE_KEY_HISTORY = 'kai_tarot_readings_history_v1';
const STORAGE_PREFIX_DAILY = 'kai_tarot_daily_';

export class TarotPersistenceService {
  constructor(storage = null) {
    this.storage = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    this.memoryStore = new Map();
  }

  /**
   * Helper to format today's local date as YYYY-MM-DD
   */
  getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Generates a stable key for daily reading
   */
  getDailyStorageKey(userId = 'guest', dateStr = null) {
    const date = dateStr || this.getLocalDateString();
    return `${STORAGE_PREFIX_DAILY}${userId}_${date}`;
  }

  /**
   * Retrieves today's saved daily reading if one was already completed
   */
  getDailyReading(userId = 'guest', dateStr = null) {
    const key = this.getDailyStorageKey(userId, dateStr);
    return this.getItem(key);
  }

  /**
   * Saves a completed daily reading anchored to local date
   */
  saveDailyReading(reading, userId = 'guest', dateStr = null) {
    const key = this.getDailyStorageKey(userId, dateStr);
    this.setItem(key, reading);
    // Also save into main history archive
    this.saveReading(reading);
  }

  /**
   * Saves any completed reading into history
   */
  saveReading(reading) {
    if (!reading || !reading.id) return;

    const history = this.getReadingHistory();
    // Prepend new reading; avoid duplicate id
    const filtered = history.filter(r => r.id !== reading.id);
    const updated = [reading, ...filtered];

    this.setItem(STORAGE_KEY_HISTORY, updated);
  }

  /**
   * Returns all saved readings, newest first
   */
  getReadingHistory() {
    const data = this.getItem(STORAGE_KEY_HISTORY);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Reopens a reading by ID
   */
  getReadingById(id) {
    const history = this.getReadingHistory();
    return history.find(r => r.id === id) || null;
  }

  /**
   * Deletes a reading from history
   */
  deleteReading(id) {
    const history = this.getReadingHistory();
    const updated = history.filter(r => r.id !== id);
    this.setItem(STORAGE_KEY_HISTORY, updated);
    return true;
  }

  /**
   * Clears all tarot readings (for biometric/privacy purge)
   */
  clearAllReadings() {
    if (this.storage) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key && (key.startsWith(STORAGE_PREFIX_DAILY) || key === STORAGE_KEY_HISTORY)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => this.storage.removeItem(k));
      } catch (e) {
        console.warn('[TarotPersistence] Failed to purge storage:', e);
      }
    }
    this.memoryStore.clear();
  }

  // Low-level storage get/set with JSON serialization
  getItem(key) {
    if (this.storage) {
      try {
        const val = this.storage.getItem(key);
        return val ? JSON.parse(val) : null;
      } catch (e) {
        console.warn(`[TarotPersistence] Failed to read ${key}:`, e);
      }
    }
    return this.memoryStore.get(key) || null;
  }

  setItem(key, value) {
    const jsonStr = JSON.stringify(value);
    if (this.storage) {
      try {
        this.storage.setItem(key, jsonStr);
      } catch (e) {
        console.warn(`[TarotPersistence] Failed to save ${key}:`, e);
      }
    }
    this.memoryStore.set(key, value);
  }
}

export const defaultTarotPersistence = new TarotPersistenceService();
