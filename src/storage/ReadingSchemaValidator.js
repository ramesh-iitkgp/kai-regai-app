/**
 * Kai RegAI — Reading Schema & Integrity Validator
 * Phase: P11 — Secure User, Session & Reading History Architecture
 * 
 * Validates persisted ReadingRecord instances:
 * - Schema version and mandatory structural properties
 * - Valid lifecycle status and ownership model
 * - Zero raw biometric image or camera buffer leakage
 * - Content hash integrity verification
 */

import { READING_STATUS, OWNER_TYPE } from './ReadingSchema.js';
import { StorageSerializer } from './StorageSerializer.js';

export class ReadingSchemaValidator {
  /**
   * Validate a ReadingRecord instance or plain object
   * @param {Object} record
   * @param {Object} [options={}]
   * @param {boolean} [options.verifyHash=false]
   * @returns {Promise<{ valid: boolean, errors: string[] }>}
   */
  static async validate(record, options = {}) {
    const errors = [];

    if (!record || typeof record !== 'object') {
      return { valid: false, errors: ['ReadingRecord must be a non-null object'] };
    }

    // 1. Schema Version & Identifiers
    if (record.schemaVersion !== '1.0.0') {
      errors.push(`Unsupported schemaVersion: '${record.schemaVersion}'. Expected '1.0.0'`);
    }
    if (!record.readingId || typeof record.readingId !== 'string') {
      errors.push('ReadingRecord missing valid readingId');
    }
    if (!record.ownerId || typeof record.ownerId !== 'string') {
      errors.push('ReadingRecord missing valid ownerId');
    }
    if (!Object.values(OWNER_TYPE).includes(record.ownerType)) {
      errors.push(`Invalid ownerType: '${record.ownerType}'`);
    }

    // 2. Lifecycle Status
    if (!Object.values(READING_STATUS).includes(record.status)) {
      errors.push(`Invalid reading status: '${record.status}'`);
    }

    // 3. Snapshots verification
    if (record.status === READING_STATUS.COMPLETE) {
      if (!record.reportSnapshot || typeof record.reportSnapshot !== 'object') {
        errors.push('Completed ReadingRecord missing reportSnapshot');
      }
      if (!record.versions || typeof record.versions !== 'object') {
        errors.push('Completed ReadingRecord missing version metadata');
      } else {
        if (!record.versions.p8CodexVersion) errors.push('Missing p8CodexVersion');
        if (!record.versions.p9NarrationVersion) errors.push('Missing p9NarrationVersion');
        if (!record.versions.p10ReportSchemaVersion) errors.push('Missing p10ReportSchemaVersion');
      }
    }

    // 4. Biometric Privacy Invariant: NO raw images or camera buffers
    const forbiddenKeys = [
      'rawImage', 'cameraImage', 'imageBuffer', 'cameraFrame',
      'rawFrame', 'videoFrame', 'pixelArray', 'imageData'
    ];

    const checkNoBiometrics = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (forbiddenKeys.includes(key)) {
          errors.push(`Biometric Privacy Violation: Forbidden raw image field '${path}${key}' detected in persistence record`);
        }
        if (typeof obj[key] === 'object') {
          checkNoBiometrics(obj[key], `${path}${key}.`);
        }
      }
    };
    checkNoBiometrics(record);

    // 5. Optional Cryptographic Hash Integrity Verification
    if (options.verifyHash && record.contentHash) {
      const hashPayload = typeof record.getHashPayload === 'function'
        ? record.getHashPayload()
        : {
            schemaVersion: record.schemaVersion,
            readingId: record.readingId,
            ownerId: record.ownerId,
            readingMethod: record.readingMethod,
            reportTier: record.reportTier,
            featureSnapshot: record.featureSnapshot,
            interpretationSnapshot: record.interpretationSnapshot,
            narrationSnapshot: record.narrationSnapshot,
            reportSnapshot: record.reportSnapshot,
            versions: record.versions
          };

      const computedHash = await StorageSerializer.computeHash(hashPayload);
      if (computedHash !== record.contentHash) {
        errors.push(`Integrity Hash Mismatch: Expected '${record.contentHash}' but computed '${computedHash}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
