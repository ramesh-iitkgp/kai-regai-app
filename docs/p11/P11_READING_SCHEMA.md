# P11 Reading Schema & Record Contract Specification

## 1. Schema Overview

The Kai RegAI `ReadingRecord` (`schemaVersion: "1.0.0"`) is the immutable snapshot saved to storage when a reading session concludes.

---

## 2. Canonical JSON Schema Representation

```json
{
  "schemaVersion": "1.0.0",
  "readingId": "RDG-1790325000000-ABCD",
  "createdAt": "2026-09-25T08:00:00.000Z",
  "updatedAt": "2026-09-25T08:00:00.000Z",
  "ownerId": "GST-1790325000000-1234abcd",
  "ownerType": "GUEST",
  "readingMethod": "MODE_1_CAMERA",
  "reportTier": "PREMIUM",
  "status": "COMPLETE",

  "featureSnapshot": {
    "hand_side": "RIGHT",
    "quality_score": 0.92,
    "major_lines": {
      "life": { "status": "DETECTED" },
      "head": { "status": "DETECTED" },
      "heart": { "status": "DETECTED" },
      "fate": { "status": "PARTIAL" },
      "sun": { "status": "NOT_DETECTED" }
    },
    "tags": ["Vedic", "Earth Elemental Base"]
  },

  "interpretationSnapshot": {
    "id": "DOSSIER-001",
    "confidence": 0.86,
    "confidence_band": "HIGH",
    "major_lines": [],
    "synthesis_chapters": {},
    "evidence": []
  },

  "narrationSnapshot": {
    "title": "Personal Hastarekha Reading",
    "headline": "A dynamic reflection of constitutional vitality and purpose.",
    "keyThemes": [],
    "sections": []
  },

  "reportSnapshot": {
    "schemaVersion": "1.0.0",
    "reportId": "RPT-001",
    "summary": {},
    "sections": [],
    "palmVisualization": {},
    "majorLines": [],
    "sources": [],
    "confidence": {}
  },

  "versions": {
    "p8CodexVersion": "1.0.0",
    "p9NarrationVersion": "1.0.0",
    "p10ReportSchemaVersion": "1.0.0"
  },

  "contentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",

  "metadata": {
    "displayTitle": "Personal Hastarekha Reading",
    "handSide": "RIGHT",
    "confidenceBand": "HIGH",
    "summary": "A dynamic reflection of constitutional vitality and purpose.",
    "isFavorite": false,
    "userNotes": "",
    "tags": ["Rapid Camera Scan", "PREMIUM"]
  }
}
```

---

## 3. Strict Pre-Save Validation Invariants

`ReadingSchemaValidator` enforces:
1. `schemaVersion === "1.0.0"`.
2. Valid lifecycle status (`CREATING`, `PROCESSING`, `COMPLETE`, `FAILED`, `DELETED`).
3. Complete engine versions (`p8CodexVersion`, `p9NarrationVersion`, `p10ReportSchemaVersion`).
4. **Biometric Privacy Shield**: Hard rejection if forbidden keys (`rawImage`, `cameraImage`, `imageBuffer`, `cameraFrame`, `pixelArray`, etc.) are detected anywhere in the payload.
5. **Cryptographic Integrity**: SHA-256 content hash re-verification matching `contentHash`.
