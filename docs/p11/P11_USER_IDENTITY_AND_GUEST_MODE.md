# P11 User Identity & Guest Mode Architecture

## 1. Guest-First Philosophy

Kai RegAI respects user agency and privacy by eliminating mandatory signups:
* First-time users immediately enter an anonymous **Guest Session**.
* No email, phone number, name, or device advertising ID is required to scan or view a reading.
* Guest readings persist locally in IndexedDB, giving users a complete "My Readings" archive out of the box.

---

## 2. Guest Identity Generation (`GuestIdentityProvider.js`)

* Format: `GST-<timestamp>-<cryptoRandom>` (e.g. `GST-1790325018429-a1b2c3d4`).
* Generated via `globalThis.crypto.randomUUID()`.
* Non-semantic and unguessable.
* Preserved in local storage until the user executes a 1-tap data purge.

---

## 3. Seamless Guest-to-Account Upgrade (`MockAuthProvider.js`)

When a user chooses to create an authenticated account or link an email:
```text
Guest User (GST-1234)
   ├── Local Reading A (ownerId: GST-1234)
   └── Local Reading B (ownerId: GST-1234)
          ↓
   Account Upgrade (user@example.com)
          ↓
Authenticated Account (USR-5678)
   ├── Local Reading A (ownerId: USR-5678, ownerType: ACCOUNT)
   └── Local Reading B (ownerId: USR-5678, ownerType: ACCOUNT)
```

### Invariants:
1. **Zero Data Loss**: Existing local readings are atomically reassigned to the new account ID.
2. **Account Switching Isolation**: Logging out switches back to a clean guest identity. Account A readings are not visible to Account B.
