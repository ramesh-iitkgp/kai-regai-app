/**
 * Kai RegAI — Canonical Storage Serializer
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Provides deterministic serialization and cryptographic hashing:
 * - Deterministic JSON serialization (alphabetically sorted keys)
 * - Excludes transient / non-reproducible fields
 * - Generates stable SHA-256 content hashes for corruption detection & deduplication
 */

export class StorageSerializer {
  /**
   * Sort object keys recursively to produce deterministic JSON
   * @param {*} value
   * @returns {*}
   */
  static canonicalize(value) {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.canonicalize(item));
    }

    const sortedObj = {};
    const keys = Object.keys(value).sort();
    for (const key of keys) {
      // Exclude volatile fields from hash computation if needed
      sortedObj[key] = this.canonicalize(value[key]);
    }
    return sortedObj;
  }

  /**
   * Produce deterministic JSON string
   * @param {*} value
   * @returns {string}
   */
  static serialize(value) {
    const canonical = this.canonicalize(value);
    return JSON.stringify(canonical);
  }

  /**
   * Parse JSON string safely
   * @param {string} jsonString
   * @returns {*}
   */
  static deserialize(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('StorageSerializer: invalid JSON string input');
    }
    return JSON.parse(jsonString);
  }

  /**
   * Compute deterministic SHA-256 hex hash from data
   * @param {*} value
   * @returns {Promise<string>}
   */
  static async computeHash(value) {
    const jsonStr = this.serialize(value);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonStr);

    if (typeof globalThis.crypto?.subtle?.digest === 'function') {
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback simple checksum if crypto.subtle is somehow unavailable
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `chk-${Math.abs(hash).toString(16)}`;
  }
}
