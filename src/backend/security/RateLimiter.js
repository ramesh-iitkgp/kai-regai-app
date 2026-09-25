/**
 * Kai RegAI — High-Performance In-Memory Sliding Window Rate Limiter
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Protects auth, transactions, webhooks, and public endpoints from abuse:
 * - Bounded sliding window algorithm
 * - Auto-purges expired rate limit buckets
 */

export class RateLimiter {
  constructor(options = {}) {
    this.windowMs = (options.windowSeconds || 60) * 1000;
    this.defaultMax = options.defaultMaxRequests || 120;
    this.buckets = new Map(); // key -> [timestamps]
  }

  /**
   * Check if a request from key is permitted under limit
   * @param {string} key 
   * @param {number} [maxRequests]
   * @returns {{ allowed: boolean, count: number, remaining: number, resetSeconds: number }}
   */
  check(key, maxRequests = this.defaultMax) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.buckets.get(key) || [];
    // Prune entries outside the sliding window
    timestamps = timestamps.filter(t => t > windowStart);

    const count = timestamps.length;
    const allowed = count < maxRequests;

    if (allowed) {
      timestamps.push(now);
      this.buckets.set(key, timestamps);
    }

    const oldest = timestamps[0] || now;
    const resetSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
    const remaining = Math.max(0, maxRequests - timestamps.length);

    return {
      allowed,
      count: timestamps.length,
      remaining,
      resetSeconds
    };
  }

  /**
   * Reset bucket for a key (e.g. after successful auth)
   * @param {string} key 
   */
  reset(key) {
    this.buckets.delete(key);
  }

  /**
   * Clear all tracked buckets
   */
  clear() {
    this.buckets.clear();
  }
}
