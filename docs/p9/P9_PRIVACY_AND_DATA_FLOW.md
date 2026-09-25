# P9 Biometric Privacy & Data Flow Specification

## 1. Overview & Biometric Safeguards

Kai RegAI enforces strict biometric privacy controls:
> **Raw palm photos and biometric pixel data are NEVER transmitted to external AI narrators or third-party LLMs.**

The narration pipeline operates solely on the anonymized, structured `NarrationContext` derived from the P8 `InterpretationDossier`.

---

## 2. End-to-End Data Flow

```text
[Camera Frame / Photo] (Processed locally in device RAM)
         │
         ▼
[P5/P5.2 CV Engine] (Extracts landmark coordinates & crease features)
         │
         ▼
[PalmFeatureModel] (Normalized geometric tokens & enums)
         │
         ▼
[P8 Rule Engine] (Generates structured InterpretationDossier)
         │
         ▼
[P9 NarrationContextBuilder] (Context Firewall: strips raw internal coordinates)
         │
         ▼
[Narration Context Payload] (Only text traits & traditional citations)
         │
         ▼
[AI Narrator / LLM] (Generates prose)
```

---

## 3. Data Minimization & Retention

1. **Zero Raw Image Transmission**: Neither JPEG, PNG, nor base64 bitmap data is ever included in the prompt payload sent to AI providers.
2. **Zero PII**: No email addresses, device identifiers, or GPS coordinates are passed to the narration context.
3. **Ephemeral Processing**: Palmar images remain in volatile memory and are purged upon session completion or user exit.
4. **Offline Capability**: When network connectivity is disabled or unavailable, the built-in `DeterministicNarrator` provides 100% on-device narration with zero data leaving the handset.
