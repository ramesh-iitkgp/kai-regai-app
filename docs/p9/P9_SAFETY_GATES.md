# P9 Epistemic Safety Gates & Ethics Specification

## 1. Overview & Double-Layer Epistemic Firewall

Kai RegAI operates under strict ethical guidelines separating traditional cultural reflection from deterministic fortune-telling and clinical medical claims. The `NarrationSafetyGate` (`src/narration/NarrationSafetyGate.js`) acts as the second, independent layer of defense after P8's static rule validation.

---

## 2. Forbidden Claim Taxonomy

### 2.1 Category 1: Fatalism & Deterministic Predictions
* **Lifespan / Mortality**: Banned patterns include `you will die`, `live until age \d+`, `lifespan of \d+`.
* **Marital Outcomes**: Banned patterns include `destined to divorce`, `inevitable separation`.
* **Childbearing**: Banned patterns include `you will have \d+ children`.
* **Guaranteed Wealth**: Banned patterns include `destined to become a millionaire`, `guaranteed wealth`, `win the lottery`.
* **Inevitable Misfortune**: Banned patterns include `inevitable accident`, `inescapable misfortune`, `curse`.

### 2.2 Category 2: Medical Diagnoses & Health Claims
* **Cardiology & Pathology**: Banned patterns include `heart attack`, `cardiac disease`, `stroke`, `artery blockage`, `cancer`.
* **Organ Systems**: Banned patterns include `liver disease`, `kidney failure`, `neurological disorder`.
* **Psychiatry**: Banned patterns include `clinical depression`, `bipolar`, `schizophrenia`.
* **Clinical Prescriptions**: Banned patterns include `prescribe`, `medical treatment recommendation`.

### 2.3 Category 3: False Scientific Authority (Scientism)
* Banned claims stating that palm reading is a scientifically proven forecasting system (*"science proves your palm dictates your soulmate"*).

---

## 3. Enforcement Action

If any regex or semantic check triggers in `NarrationSafetyGate.inspect(payload)`:
* `safe` is set to `false`.
* The violation reasons are logged into `fallbackReason`.
* The AI payload is rejected immediately, and `DeterministicNarrator` provides an ethical, reflective reading.
