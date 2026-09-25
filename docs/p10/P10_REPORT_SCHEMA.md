# P10 Report Schema & Data Contract Specification

## 1. Schema Overview

The Kai RegAI Report Schema (`schemaVersion: "1.0.0"`) is the immutable data model returned by `createReport()`. It represents a verified reading ready for rendering, export, or archival.

---

## 2. Canonical JSON Schema Representation

```json
{
  "schemaVersion": "1.0.0",
  "reportId": "RPT-1774512345678-ABCD",
  "generatedAt": "2026-09-25T07:30:00.000Z",
  "readingMethod": "MODE_1_CAMERA",
  "readingMethodLabel": "Rapid Camera Scan",
  "reportTier": "PREMIUM",

  "subject": {
    "displayName": null,
    "handSide": "RIGHT",
    "handDominance": "DOMINANT"
  },

  "summary": {
    "title": "Personal Hastarekha Reading",
    "headline": "A dynamic reflection of constitutional vitality and purpose.",
    "opening": "Welcome to your Kai RegAI personal palm reading.",
    "overviewText": "Analysis of the visible palmar crease architecture...",
    "keyThemes": [
      {
        "id": "theme_vitality",
        "label": "Constitutional Vitality",
        "insight": "Steady physical stamina supported by mindful pacing.",
        "confidenceBand": "HIGH"
      }
    ]
  },

  "sections": [
    {
      "id": "section_constitution",
      "heading": "Chapter I: Constitution & Vitality Flow",
      "paragraphs": [
        "Your vitality crease traces a wide, uninterrupted arc around the thenar eminence..."
      ],
      "evidenceRefs": ["lines.life_line"]
    }
  ],

  "palmVisualization": {
    "viewBox": "0 0 360 450",
    "lines": {
      "life": { "path": "M 128 178 Q 146 220 148 290...", "status": "DETECTED" },
      "head": { "path": "M 128 180 Q 185 190 236 215...", "status": "DETECTED" },
      "heart": { "path": "M 285 158 Q 230 148 185 142...", "status": "DETECTED" },
      "fate": { "path": "M 190 380 L 188 235...", "status": "PARTIAL" },
      "sun": { "path": "M 224 235 L 222 135...", "status": "NOT_DETECTED" }
    },
    "dominantColor": "#00D2FF",
    "elementalBase": "Earth Elemental Base"
  },

  "majorLines": [
    {
      "key": "life_line",
      "name": "Life Line (Ayur Rekha)",
      "status": "DETECTED",
      "color": "#A855F7",
      "glyph": "square",
      "tier1_observation": "Continuous curvilinear furrow encircling Mount of Venus with high depth.",
      "tier2_western": "Associated with physical stamina, constitutional vigor, and vitality rhythm.",
      "tier3_hasta_samudrika": "Signifies Ayus (longevity flow), vitality sustenance, and bodily resilience.",
      "tier4_synthesis": "Reflects grounded bodily resilience and steady vitality regulation.",
      "confidence": 0.88
    }
  ],

  "features": {
    "mounts": [],
    "thumb": {},
    "markings": []
  },

  "evidence": [
    {
      "ruleId": "RULE_LIFE_CONTINUOUS",
      "domain": "LINES_LIFE",
      "featurePath": "lines.life_line",
      "confidence": 0.88,
      "tradition": "HASTA_SAMUDRIKA"
    }
  ],

  "confidence": {
    "score": 0.86,
    "band": "HIGH",
    "qualityScore": 0.92,
    "isConstrained": false
  },

  "sources": [
    { "sourceId": "SRC_WESTERN", "name": "Classical Western Palmistry (Cheiro, Benham)", "tradition": "Western Classical" },
    { "sourceId": "SRC_HASTA", "name": "Hasta Samudrika (Samudrika Shastra, Narada Samhita)", "tradition": "Hasta Samudrika" },
    { "sourceId": "SRC_KAI_SYN", "name": "Kai RegAI Archetypal Synthesis", "tradition": "Kai RegAI" }
  ],

  "uncertaintyNotes": [],

  "metadata": {
    "codexVersion": "1.0.0",
    "narrationVersion": "1.0.0",
    "promptVersion": "1.0.0",
    "generationMode": "AI_ORCHESTRATED",
    "fallbackTriggered": false
  },

  "export": {
    "pdfReady": true,
    "socialCardsAvailable": ["1:1", "4:5", "9:16"],
    "disclaimer": "Kai RegAI presents traditional palm-reading interpretations for reflection and personal exploration. These interpretations are not scientific predictions, medical diagnoses, or financial guarantees."
  }
}
```

---

## 3. Epistemic Integrity Validation Rules

The `ReportSchemaValidator` ensures:
1. `schemaVersion` is strictly `"1.0.0"`.
2. `reportTier` is one of `QUICK`, `STANDARD`, or `PREMIUM`.
3. `readingMethod` is one of `MODE_1_CAMERA` or `MODE_2_QUESTIONNAIRE`.
4. `summary.keyThemes` contains between 1 and 5 validated theme items.
5. Zero fatalistic predictions (e.g., life expiration dates, guaranteed fortunes, curses).
6. Zero medical diagnoses (e.g., clinical disease identification, cardiac illness claims).
