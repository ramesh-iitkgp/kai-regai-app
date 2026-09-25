# Kai RegAI — P4 Screen State Matrix

**Phase**: P4 — UI Integration  
**Status**: COMPLETE

---

## 1. Screen State Transition Matrix

| Screen ID | Screen Name | Supported States | Primary Actions | Exit Paths |
|---|---|---|---|---|
| `SCR-ONB-001..003` | Splash Onboarding | Genesis Story (0), Modes Prop (1), Biometric Permissions (2) | "Begin Reading", "Next", "Skip" | `#home` |
| `SCR-HOM-001` | Home Hub | Default Hub, Active User Greeting, Recent Reading Preview | "Launch Scanner", "Explore Guided Reading", "View Archive" | `#scanner`, `#guided-reading`, `#readings`, `#learn` |
| `SCR-SCN-001` | Hand Scanner HUD | Viewfinder Active, Torch On/Off, Left/Right Flip, 10s Progressive Analysis, Optical Error Recovery | "Begin 10s Optical Scan", "Torch", "Flip", "Exit" | `#quick-report`, `#home` |
| `SCR-SCN-002` | Quick Report | Illuminated Hologram View, Detected Lines, Kai RegAI Synthesis Card | "Explore Full Reading", "Share PDF", "Return to Home" | `#detailed-report`, `#home` |
| `SCR-PLM-001..002` | Guided Baseline Capture | Hand Context Selection (Right Active vs Left Potential), Anatomical Viewfinder Locked | "Select Hand", "Proceed to Questions" | `#questionnaire`, `#home` |
| `SCR-PLM-003..004` | Questionnaire & Synthesis | 5 Interactive Question Steps, Synthesis Transition Mandala | "Select Option", "Next", "Back", "Synthesize" | `#detailed-report`, `#guided-reading` |
| `SCR-PLM-005` | Detailed Palm Dossier | Overview Tab, Lines Tab (Life/Head/Heart/Fate/Sun), Features Tab (Mounts/Marks), Synthesis Chapters | "Switch Tab", "Select Line", "Export PDF", "Back" | `#readings`, Modal `pdf_export` |
| `SCR-RDG-001..002` | Readings Archive | All Filter, Quick Scans Filter, Guided Dossiers Filter, Hand Comparator Alert | "Filter Readings", "Open Reading Detail", "Compare Hands" | `#quick-report`, `#detailed-report` |
| `SCR-LRN-001..002` | Hastarekha Codex | Category Tabs (Lines/Mounts/Hand/Marks/Traditions), Article Detail Reader | "Switch Category", "Select Article" | Internal category navigation |
| `SCR-PRF-001..004` | Profile & Privacy | Profile Info, Dominant Hand Toggle, Biometric Privacy Status, 1-Tap Erase Data | "Toggle Dominant Hand", "Erase All Biometric Data" | Confirmation Dialog |
| `SCR-OFF-001` | Offline Fallback | Offline Status Banner, Local Cached Readings Index | "Open Cached Reading", "Return to Home" | `#home`, `#quick-report` |

---

## 2. Modal Stack Lifecycle

1. `pdf_export`:
   * Triggered from: `QuickReportScreen`, `DetailedReportScreen`.
   * Actions: Download High-Res PDF (300 DPI simulated print), Share Encrypted Link, Dismiss.
2. `error_calibration`:
   * Triggered from: `ScannerScreen` on low light, excessive movement, or invalid distance.
   * Actions: Recalibrate & Retry, Switch to Guided Mode, Dismiss.
