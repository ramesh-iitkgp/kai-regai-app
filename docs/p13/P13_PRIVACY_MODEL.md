# P13 — Production Privacy Model & Biometric Protection

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** The Story Written in Your Hands.  
**Phase:** P13 — Production Backend & Commercial Authority  
**Status:** APPROVED & AUTHORITATIVE  

---

## 1. Absolute Privacy Invariants

Kai RegAI operates under strict biometric and data privacy safeguards:

### Invariant 8: STORE THE READING, NOT THE PERSON.
The backend stores:
- Derived, normalized geometric features (e.g. line curvature, length ratios, mount prominence).
- Structured interpretation codex matches.
- Generated narrative report chapters and summary takeaways.
- Synchronized reading metadata and content hashes.

The backend does **NOT** store:
- Government IDs, real names (unless voluntarily provided), telephone numbers, or demographic trackers.
- Raw camera imagery or visual biometric recordings.

### Invariant 9: RAW PALM IMAGES MUST NOT BECOME A DEFAULT SERVER-SIDE DATASET.
All palm crease detection, line tracing, and segmentation occur **locally on-device** in the client CV pipeline (P5/P5.1/P5.2). The server never accepts, ingests, or retains raw camera frames or pixel buffers.

---

## 2. Server-Side Biometric Privacy Guard (`PrivacyGuard`)

The `PrivacyGuard` middleware and service layer automatically inspect all payloads during reading save, batch synchronization, and export operations.

### Blocked Payload Patterns
```text
/rawImage/i                                -> Raw biometric image property rejected
/cameraImage/i                             -> Raw camera photograph rejected
/imageBuffer/i                             -> Raw image buffer payload rejected
/cameraFrame/i                             -> Optical camera frame payload rejected
/pixelData/i                               -> Raw pixel matrix rejected
/data:image\/(jpeg|png|webp);base64,/i     -> Embedded base64 image data rejected
/cardNumber/i                              -> Credit card number prohibited
/cvv/i / /cvc/i                            -> Card security codes prohibited
/cardExpiry/i                              -> Card expiry data prohibited
```

If any blocked pattern is detected, the request is immediately rejected with `400 Bad Request` and audited.

---

## 3. Ephemeral Guest Mode & Identity Isolation

- Anonymous users interact via ephemeral guest sessions (`GST-...`).
- No email, phone number, or credentials are required to obtain an initial palm reading.
- Guest sessions can be upgraded seamlessly to authenticated accounts (`USR-...`) via atomic ownership migration when the user chooses to register or sync across devices.

---

## 4. GDPR & 1-Tap Data Purge Compliance

Users retain complete sovereignty over their data:
1. **Reading Deletion (`DELETE /api/v1/readings/:id`)**:
   - Soft-deletes the reading from active queries immediately.
   - Deletion propagates across synchronized devices during sync pull.
2. **Account Deletion (`DELETE /api/v1/users/me`)**:
   - Deletes user identity and sessions.
   - Soft-deletes all associated readings.
   - Revokes active entitlements.
   - Retains anonymized transaction records strictly for financial accounting and tax compliance, decoupled from personal identifiers.
