# P11 Privacy Architecture Specification

## 1. Zero-Biometric Persistence Mandate

Kai RegAI treats hand geometry and palmar lines with biometric caution:
```text
Raw Palm Image (Camera / Video)
           ↓
    RAM Processing Only
           ↓
Crease Extraction (P5 / P6)
           ↓
   PalmFeatureModel (Geometry only)
           ↓
[DESTROY RAW IMAGE BUFFER IMMEDIATELY]
```

### Invariants:
1. **Never Persist Class A Data**: Raw photographs, uncompressed frames, and pixel buffers are barred from IndexedDB, localStorage, filesystems, and remote endpoints.
2. **Schema Validator Enforcement**: `ReadingSchemaValidator` scans all persistence records recursively and rejects records containing forbidden biometric keys.
3. **No Biometric Telemetry**: Telemetry events contain only coarse operational strings (`reportTier`, `durationMs`, `readingMethod`).

---

## 2. Privacy by Design in History & Sharing

* **History Thumbnails**: History listings display derived vector SVG lines or sacred glyphs—never raw hand photographs.
* **Anonymous by Default**: Guest seekers use anonymous IDs without email or phone requirements.
* **Opt-In Sync**: Cloud persistence is off by default and requires conscious opt-in.
