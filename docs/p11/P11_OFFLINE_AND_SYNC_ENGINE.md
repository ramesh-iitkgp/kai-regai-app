# P11 Offline-First & Sync Engine Architecture

## 1. Offline-First Philosophy

Network access must never be a prerequisite for Kai RegAI to perform readings:
* Users can open the application, run the camera scan or questionnaire, synthesize P8/P9/P10 reports, and save readings completely offline.
* Cloud synchronization is strictly an optional enhancement requiring explicit user consent.

---

## 2. Sync Queue Architecture (`SyncQueue.js`)

All outbound cloud actions pass through an offline-resilient sync queue:
```text
Reading Created / Deleted
            │
            ▼
┌───────────────────────┐
│       SyncQueue       │
│ Status: PENDING       │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Attempt Sync (Online) │
│ Status: UPLOADING     │
└─────┬───────────┬─────┘
      │           │
   Success      Failure
      │           │
      ▼           ▼
┌───────────┐ ┌───────────┐
│  SYNCED   │ │   RETRY   │ (Bounded to 3 attempts)
└───────────┘ └───────────┘
```

---

## 3. Idempotency & Conflict Resolution

* **Idempotency**: Every remote write carries a deterministic `readingId` and `contentHash`. If a reading is transmitted multiple times due to network retries, the server identifies the duplicate and acknowledges success without creating multiple records.
* **Immutable Completed Records**: Historical readings are immutable; conflicts cannot occur on completed interpretations.
* **Server-Side Authorization & IDOR Protection**: `RemoteReadingStore` verifies session identity on every request. User A is strictly forbidden from viewing or mutating User B's records.
