# P10 Golden Report Corpus Specification

## 1. Overview & Golden Invariants

To guarantee that Kai RegAI never regresses, produces malformed reports, leaks sensitive data, or drifts into ungrounded claims, a 15-case **Golden Report Corpus** is tested in `tests/report/golden/goldenReports.js`:

1. **GOLDEN_RPT_01_COMPLETE_STRONG**: Complete 5-line strong palm in Premium Tier. Verifies 4 chapters, dedicated cover, 5 major lines, and traditional citations.
2. **GOLDEN_RPT_02_PARTIAL_PALM**: Partial / faint crease palm in Standard Tier. Verifies honest uncertainty notes without claim inflation.
3. **GOLDEN_RPT_03_MISSING_FATE_LINE**: Out-of-frame Fate Line. Verifies `OUT_OF_FRAME` status and absence of fatalistic claims.
4. **GOLDEN_RPT_04_MISSING_SUN_LINE**: Undetected Sun Line. Verifies `NOT_DETECTED` status and absence of prestige overreach.
5. **GOLDEN_RPT_05_LOW_CONFIDENCE**: Low-confidence optical capture. Verifies constrained epistemic wording.
6. **GOLDEN_RPT_06_MODE_1_CAMERA**: Mode 1 Camera rapid scan. Verifies Quick Tier with 1 narrative chapter and executive summary.
7. **GOLDEN_RPT_07_MODE_2_QUESTIONNAIRE**: Mode 2 Guided Questionnaire. Verifies Premium Tier with subjective tactile feature integration.
8. **GOLDEN_RPT_08_CONFLICTING_TRADITIONS**: Conflicting Western vs Hasta Samudrika traditions. Verifies preservation of dual perspectives.
9. **GOLDEN_RPT_09_MULTIPLE_THEMES**: Thematic diversity. Verifies 3–5 distinct takeaway cards.
10. **GOLDEN_RPT_10_AI_NARRATION**: Full AI narrated reading integration. Verifies `generationMode: AI_ORCHESTRATED`.
11. **GOLDEN_RPT_11_DETERMINISTIC_FALLBACK**: Offline / fallback mode. Verifies `generationMode: DETERMINISTIC_FALLBACK`.
12. **GOLDEN_RPT_12_LONG_DETAILED_REPORT**: Archival detailed report structure. Verifies literature concordance and ethical disclaimers.
13. **GOLDEN_RPT_13_MINIMAL_EVIDENCE**: Minimal / fragmented feature model. Verifies graceful degradation in Quick Tier.
14. **GOLDEN_RPT_14_SOCIAL_CARD**: Social card generation. Verifies 1:1, 4:5, 9:16 card availability with zero PII.
15. **GOLDEN_RPT_15_PDF_EXPORT**: Standalone print document compilation. Verifies valid A4 `@page` rules and metadata.
