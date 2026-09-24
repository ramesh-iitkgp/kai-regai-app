# Kai RegAI — Privacy & Biometric Data UX Specification

## 1. Privacy Philosophy: Sovereign Biometrics

Palm imagery constitutes sensitive personal representation. Users must feel absolute trust and sovereignty over their physical image and derived data.

```
+─────────────────────────────────────────────────────────────────────────────+
|                         PRIVACY-FIRST DATA INVARIANT                        |
|                                                                             |
|  1. Transient Camera Processing: Raw palm image frames reside in volatile   |
|     device RAM only during active landmark detection and line segmentation. |
|                                                                             |
|  2. Zero Persistent Raw Photo Storage: Once the PalmFeatureModel JSON       |
|     is generated, the raw camera frame buffer is purged from memory.        |
|                                                                             |
|  3. What is Saved in History: Only mathematical coordinates, extracted     |
|     feature classifications, and written narrative reports.                 |
|                                                                             |
|  4. Sovereign User Erasure: A prominent 1-tap deletion control allows the  |
|     user to instantly wipe all saved palm data and reading history.         |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. In-App Privacy Touchpoints & User Disclosures

### A. Contextual Camera Permission Primer (`SCR-ONB-003`)
* **When Triggered**: Just-in-time, immediately prior to the user's first scan.
* **UX Copy**:
  * *Headline*: *"Your Hands Are Sacred & Private"*
  * *Body*: *"Kai RegAI uses your camera in real time to trace palm lines and measure hand geometry. Your raw camera frames are processed directly on your device and are never permanently stored or shared without your explicit permission."*
  * *CTAs*: *"Enable Camera & Continue"* / *"Learn More About Our Privacy Architecture"*.

### B. Cloud vs. Local Processing Clarification
* **On-Device Edge CV**: Palm landmark alignment, boundary framing, and crease segmentation execute locally on the device (via CoreML / TFLite).
* **Encrypted Backend Interpretation**: The anonymized `PalmFeatureModel` JSON payload (containing coordinate splines and numbers, zero photographic pixels) is transmitted via TLS 1.3 to the Rule and AI Narration service.

### C. One-Tap Palm Data Wipe (`SCR-PRF-002`)
* Located under **`Profile -> Privacy & Data Management`**:
* **Action**: *"Erase All My Palm Data & History"* button in high-contrast red warning styling.
* **Confirmation Dialog**:
  * *"Permanently delete all saved palm scans, custom observations, and reading dossiers from this device? This action cannot be undone."*
  * *Confirmation CTAs*: *"Delete Everything Immediately"* / *"Cancel"*.
* **Execution**: Instantly purges local SQLite/CoreData reading tables, clears cached feature models, and sends an erasure request to backend session storage.
