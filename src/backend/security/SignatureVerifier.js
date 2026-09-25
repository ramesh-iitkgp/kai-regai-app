/**
 * Kai RegAI — Webhook Signature Verifier
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Cryptographically verifies incoming payment webhook signatures:
 * - Constant-time comparison prevents timing side-channel attacks
 * - Decoupled provider verification schemes
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export class SignatureVerifier {
  /**
   * Verify HMAC-SHA256 signature
   * @param {string} payload - Raw payload string
   * @param {string} signature - Received hex/base64 signature
   * @param {string} secret - Shared webhook signing secret
   * @returns {boolean}
   */
  static verifyHmacSha256(payload, signature, secret) {
    if (!payload || !signature || !secret) return false;

    try {
      const expected = createHmac('sha256', secret).update(payload).digest('hex');
      const sigBuf = Buffer.from(signature, 'hex');
      const expBuf = Buffer.from(expected, 'hex');

      if (sigBuf.length !== expBuf.length) {
        return false;
      }

      return timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  /**
   * Compute HMAC-SHA256 signature for test simulation
   * @param {string} payload 
   * @param {string} secret 
   * @returns {string}
   */
  static computeHmacSha256(payload, secret) {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  static generateHmacSha256(payload, secret) {
    return this.computeHmacSha256(payload, secret);
  }
}
