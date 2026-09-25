# P11 Data Retention Policy

## 1. Scope & Objective

This policy defines the lifecycle, retention periods, and destruction mechanisms for data within the Kai RegAI platform.

---

## 2. Retention Matrix

| Data Classification | Storage Location | Retention Lifetime | Destruction Trigger |
| :--- | :--- | :--- | :--- |
| **CLASS A: Ephemeral Biometric Imagery** (Camera frames, video buffers, pixel arrays) | Local RAM only | < 10 seconds (duration of scan) | Immediate upon crease feature extraction |
| **CLASS B: Derived Reading Artifacts** (ReadingRecord, ReportModel, polylines) | Local IndexedDB / Encrypted Remote | Indefinite (User-controlled) | 1-Tap Data Purge or individual reading delete |
| **CLASS C: User Identity Metadata** (Guest ID, Profile display name, preferences) | Local IndexedDB / Encrypted Remote | Until account deletion or data purge | 1-Tap Data Purge or Account Deletion |
| **CLASS D: User Annotations** (Personal notes, favorites, display titles) | Local IndexedDB | Lifetime of reading record | Deletion of reading record |
| **CLASS E: Aggregated Product Telemetry** (Event names, durations, tiers) | Telemetry Sink | 30 days rolling aggregate | Automatic time-based expiration |

---

## 3. Deletion Mechanisms

* **1-Tap Local Data Purge**: Completely erases IndexedDB stores (`readings`, `profiles`, `syncQueue`, `settings`), resets guest identity, and clears session memory.
* **Individual Reading Deletion**: Removes reading record and queues remote deletion if synchronized.
* **Account Deletion**: Deletes all cloud-stored readings and associated profile records.
