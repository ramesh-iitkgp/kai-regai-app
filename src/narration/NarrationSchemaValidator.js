/**
 * Kai RegAI — Narration Schema Validator
 * Phase: P9 — AI / RAG Narration Engine
 * 
 * Strict Schema Validator:
 * - Validates AI JSON output against the canonical P9 schema
 * - Rejects malformed structures, missing required keys, or invalid types
 * - Enforces length boundaries and prevents forbidden payload fields
 */

export class NarrationSchemaValidator {
  /**
   * Validate raw AI response against P9 schema requirements
   * @param {any} payload 
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validate(payload) {
    const errors = [];

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { valid: false, errors: ['Response payload must be a non-null JSON object'] };
    }

    // Required top-level string fields
    const requiredStrings = ['title', 'opening', 'summary'];
    for (const field of requiredStrings) {
      if (typeof payload[field] !== 'string' || payload[field].trim().length === 0) {
        errors.push(`Missing or invalid required string field: '${field}'`);
      }
    }

    // Headline is optional but must be string if present
    if (payload.headline !== undefined && typeof payload.headline !== 'string') {
      errors.push("Field 'headline' must be a string");
    }

    // Validate sections
    if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
      errors.push("Field 'sections' must be a non-empty array");
    } else {
      payload.sections.forEach((section, idx) => {
        if (!section || typeof section !== 'object') {
          errors.push(`Section at index ${idx} is not an object`);
          return;
        }
        if (typeof section.id !== 'string' || !section.id) {
          errors.push(`Section at index ${idx} is missing a valid string 'id'`);
        }
        if (typeof section.heading !== 'string' || !section.heading) {
          errors.push(`Section at index ${idx} is missing a valid string 'heading'`);
        }
        if (!Array.isArray(section.paragraphs) && typeof section.text !== 'string') {
          errors.push(`Section at index ${idx} must have either 'paragraphs' array or 'text' string`);
        }
      });
    }

    // Validate keyThemes if present
    if (payload.keyThemes !== undefined) {
      if (!Array.isArray(payload.keyThemes)) {
        errors.push("Field 'keyThemes' must be an array");
      } else {
        payload.keyThemes.forEach((theme, idx) => {
          if (!theme || typeof theme !== 'object') {
            errors.push(`Theme at index ${idx} must be an object`);
          } else if (typeof theme.label !== 'string' || !theme.label) {
            errors.push(`Theme at index ${idx} missing string 'label'`);
          }
        });
      }
    }

    // Validate uncertaintyNotes if present
    if (payload.uncertaintyNotes !== undefined && !Array.isArray(payload.uncertaintyNotes)) {
      errors.push("Field 'uncertaintyNotes' must be an array");
    }

    // Reject suspicious / forbidden internal fields
    const forbiddenKeys = ['eval', 'raw_prompt', 'executeScript'];
    for (const key of forbiddenKeys) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        errors.push(`Payload contains forbidden property '${key}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
