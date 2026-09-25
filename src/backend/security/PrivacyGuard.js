/**
 * Kai RegAI — Biometric & Financial Privacy Guard
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Enforces Invariants 8 & 9:
 * - "STORE THE READING, NOT THE PERSON."
 * - "RAW PALM IMAGES MUST NOT BECOME A DEFAULT SERVER-SIDE DATASET."
 * - Zero credit card numbers or banking secrets accepted.
 */

export class PrivacyGuard {
  static FORBIDDEN_PATTERNS = [
    { pattern: /rawImage/i, reason: 'Raw biometric image property rejected' },
    { pattern: /cameraImage/i, reason: 'Raw camera photograph rejected' },
    { pattern: /imageBuffer/i, reason: 'Raw image buffer payload rejected' },
    { pattern: /cameraFrame/i, reason: 'Optical camera frame payload rejected' },
    { pattern: /pixelData/i, reason: 'Raw pixel matrix rejected' },
    { pattern: /data:image\/(jpeg|png|webp);base64,/i, reason: 'Embedded base64 image data rejected' },
    { pattern: /cardNumber/i, reason: 'Credit card number prohibited' },
    { pattern: /cvv/i, reason: 'Card CVV prohibited' },
    { pattern: /cvc/i, reason: 'Card CVC prohibited' },
    { pattern: /cardExpiry/i, reason: 'Card expiry data prohibited' }
  ];

  /**
   * Inspect an arbitrary object or string for privacy/security violations
   * @param {*} payload 
   * @returns {{ safe: boolean, violationReason?: string }}
   */
  static inspect(payload) {
    if (!payload) return { safe: true };

    let serialized = '';
    try {
      serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    } catch {
      return { safe: false, violationReason: 'Unparseable payload' };
    }

    // Size limit guard: Reject payloads > 2 MB to prevent DoS & image exfiltration
    if (serialized.length > 2 * 1024 * 1024) {
      return { safe: false, isOversized: true, violationReason: '413 Payload Too Large: Payload exceeds maximum permitted size of 2 MB' };
    }

    for (const { pattern, reason } of this.FORBIDDEN_PATTERNS) {
      if (pattern.test(serialized)) {
        return {
          safe: false,
          violationReason: `Privacy & Security Violation: ${reason}`
        };
      }
    }

    return { safe: true };
  }
}
