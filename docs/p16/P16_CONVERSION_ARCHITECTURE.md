# P16 Conversion Architecture & Ethical Monetization

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P16 — Production UX, Reading Experience & Conversion  

---

## 1. Ethical Monetization Philosophy

Kai RegAI completely rejects coercive dark patterns, fabricated scarcity, and deceptive billing. Our conversion strategy is built on **demonstrable value, epistemic rigor, and customer trust**.

### Non-Negotiable Conversion Ethics
* **NO Fake Urgency Counters**: No countdown timers claiming "Only 3 minutes left to discover your future."
* **NO Fabricated Negative Fortunes**: We never threaten users with "curses," "bad karma," or "fatal warnings" to coerce purchase.
* **NO Dark Patterns on Cancellation**: Paywall modal offers a visible, accessible close button (with accessible label and keyboard focus).
* **Transparent Multi-Currency Pricing**: Real pricing in local currencies (`INR`, `USD`, `EUR`, `GBP`) loaded directly from verified catalogs.
* **1-Tap Purchase Restoration**: Direct, reliable purchase restoration mechanism accessible from both the paywall and the user profile settings.

---

## 2. Product Tiers & Value Proposition

| Feature / Capability | Free / Preview Tier | Standard Tier | Premium Dossier Tier |
| :--- | :---: | :---: | :---: |
| **Instant Camera Scan (Mode 1)** | Included (Basic) | Included | Included |
| **Quick Summary & Major Lines** | Included | Included | Included |
| **Complete Epistemic Dossier (4 Layers)** | Preview (1st layer) | Unlocked | Unlocked |
| **Hasta Samudrika & Western Synthesis** | Preview | Unlocked | Unlocked |
| **Deep Mount & Marking Analysis** | Locked | Locked | Unlocked |
| **Archival Dossier Storage** | 3 Readings | Unlimited | Unlimited |
| **High-Res PDF & Social Card Export** | Watermarked | Clean | Premium Gold Stamped |

---

## 3. Conversion Funnel Telemetry Architecture

Conversion instrumentation operates via non-blocking, privacy-safe events implemented in `src/report/ReportTelemetry.js`:

```
LANDING_VIEW ──> START_READING ──> SCANNER_OPEN ──> HAND_DETECTED ──> CAPTURE_SUCCESS
                                                                             │
QUICK_REPORT_VIEW <──────────────────────────────────────────────────────────┘
       │
       ▼
PAYWALL_VIEW ──> PURCHASE_STARTED ──> PURCHASE_SUCCESS ──> DETAILED_REPORT_VIEW
       │                                     │
       └─────> RESTORE_STARTED ──────────────┘
```

* **Privacy Guarantee**: Telemetry events scrub all biometric landmarks, image paths, customer payment details (PCI-DSS compliance), and personal identifiers before dispatch.
