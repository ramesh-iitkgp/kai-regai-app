/**
 * Deterministic Seed Generator & PRNG for Ask the Oracle
 * Ensures reproducible, testable pseudo-random distributions without raw uncontrolled Math.random().
 */

/**
 * Computes a deterministic 32-bit integer hash from a string
 * @param {string} str Input string
 * @returns {number} 32-bit integer hash
 */
export function hashString(str = '') {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Creates a seeded Mulberry32 pseudo-random number generator function
 * @param {number} seed 32-bit seed integer
 * @returns {() => number} Function returning float in range [0, 1)
 */
export function createMulberryPRNG(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a session seed based on question text, optional time block, and optional salt
 * @param {string} question User question text
 * @param {number} [timeWindowMs=1800000] Default 30-minute block for organic consistency
 * @param {number|string} [salt=0] Optional salt
 * @returns {number} 32-bit seed
 */
export function generateOracleSeed(question = '', timeWindowMs = 1800000, salt = 0) {
  const normalized = question.toLowerCase().trim();
  const timeBlock = timeWindowMs > 0 ? Math.floor(Date.now() / timeWindowMs) : 0;
  const composite = `${normalized}::${timeBlock}::${salt}`;
  return hashString(composite);
}
