# P10 Telemetry Engine Specification

## 1. Event Model

The Kai RegAI Report Engine emits product interaction telemetry through `ReportTelemetry`:
* `report_generated`: Emitted when a report is synthesized. Includes `reportTier`, `readingMethod`, and `durationMs`.
* `report_viewed`: Emitted when a user opens a report screen.
* `section_opened`: Emitted when a user expands a specific chapter or tab.
* `pdf_exported`: Emitted when print/PDF dialog is triggered.
* `share_card_generated`: Emitted when a canvas social card is rasterized.
* `report_shared`: Emitted when native share or card download completes.

---

## 2. Non-Blocking Invariant

Telemetry operations are strictly non-blocking. If a telemetry sink or network dispatcher throws an error or experiences timeout:
* The error is caught silently.
* Report generation and UI interaction proceed unimpeded.
* Telemetry failure never breaks the user experience.
