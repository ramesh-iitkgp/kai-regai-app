# P11 Storage Architecture Specification

## 1. Architectural Mandate: Store the Reading, Not the Person

The core principle governing Phase P11 persistence is:
> **P8 DECIDES. P9 EXPLAINS. P10 PRESENTS. P11 PRESERVES.**
> Store only the necessary immutable snapshots required to reopen, verify, export, and audit a completed reading. Never store raw biometric images or camera buffers.

---

## 2. Storage Subsystem Architecture

```text
┌────────────────────────────────────────────────────────┐
│                      P11 STORAGE                       │
└───────────────────────────┬────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│StorageProvider│   │ ReadingRecord │   │   Migration   │
│ ├── IndexedDB │   │ ├── Snapshots │   │    Engine     │
│ └── Memory    │   │ └── SHA-256   │   │  (0.9 → 1.0)  │
└───────────────┘   └───────────────┘   └───────────────┘
```

### 2.1 Provider-Neutral Storage Interface (`StorageProvider.js`)
* Decoupled abstraction ensuring zero hardcoding of `indexedDB` or `localStorage` in application screens.
* **`MemoryStorageProvider.js`**: High-performance in-memory implementation for automated tests, SSR, and strict private-browsing modes.
* **`IndexedDBStorageProvider.js`**: Production client database (`KaiRegAI_DB` v1) with versioned object stores:
  * `readings`: Keyed by `readingId` with indexes on `ownerId`, `createdAt`, `readingMethod`, `status`.
  * `profiles`: User preferences and reading statistics.
  * `syncQueue`: Offline upload/delete queue items.
  * `settings`: Key-value application configurations.
  * *Auto-Fallback*: Transparently defaults to memory storage when IndexedDB is blocked or unavailable.

### 2.2 Canonical Serialization & Integrity (`StorageSerializer.js`)
* Recursively canonicalizes object keys in alphabetical order.
* Produces deterministic string representations.
* Generates SHA-256 cryptographic digests using standard `globalThis.crypto.subtle` for corruption detection and sync deduplication.
