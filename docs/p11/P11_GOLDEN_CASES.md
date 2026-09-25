# P11 Golden Persistence Corpus Specification

## 1. Overview & Golden Invariants

To guarantee that Kai RegAI never regresses, corrupts records, leaks biometrics, or loses historical readings, 15 Golden Persistence Test Cases are verified in `tests/storage/golden/goldenStorageCases.js`:

1. **GOLDEN_STR_01_GUEST_EPHEMERAL_SAVE**: Anonymous guest reading save and local archive persistence.
2. **GOLDEN_STR_02_REOPEN_HISTORICAL_REPORT**: Reopening historical report without AI call or rule re-evaluation.
3. **GOLDEN_STR_03_IMMUTABLE_SNAPSHOT**: Immutable provenance and version signatures preserved across updates.
4. **GOLDEN_STR_04_BIOMETRIC_PRIVACY_SHIELD**: Validator strictly rejects records containing raw biometric camera buffers.
5. **GOLDEN_STR_05_CONTENT_HASH_INTEGRITY**: SHA-256 integrity verification detects corrupted or tampered records.
6. **GOLDEN_STR_06_GUEST_TO_ACCOUNT_UPGRADE**: Seamless guest-to-account upgrade reassigns local readings without data loss.
7. **GOLDEN_STR_07_IDOR_PREVENTION**: IDOR protection blocks cross-account reading access and modification.
8. **GOLDEN_STR_08_IDEMPOTENT_SYNC**: Idempotent synchronization prevents duplicate records upon network retry.
9. **GOLDEN_STR_09_OFFLINE_QUEUE_RESILIENCE**: Offline sync queue handles network timeouts and retries up to 3 times.
10. **GOLDEN_STR_10_ONE_TAP_DATA_PURGE**: 1-tap data purge completely erases local readings and resets identity.
11. **GOLDEN_STR_11_JSON_ARCHIVE_EXPORT**: Structured JSON archive export without credentials or API keys.
12. **GOLDEN_STR_12_JSON_ARCHIVE_IMPORT**: Strictly validated JSON archive import with ownership reassignment.
13. **GOLDEN_STR_13_SCHEMA_MIGRATION**: Legacy 0.9.0 record cleanly migrated to 1.0.0 without evidence loss.
14. **GOLDEN_STR_14_PAGINATED_HISTORY_QUERY**: Paginated history querying with limit, offset, and method filters.
15. **GOLDEN_STR_15_TELEMETRY_NON_BLOCKING**: Telemetry failure never interrupts reading save or storage operations.
