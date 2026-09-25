# Kai RegAI — P6 Scanner State Machine Specification

**Product:** Kai RegAI  
**Descriptor:** PALM READING  
**Tagline:** *The Story Written in Your Hands.*  
**Phase:** P6 — Hand Scanner Experience  
**Status:** COMPLETE & FROZEN  

---

## 1. Overview

The `ScannerStateMachine` is the single source of truth for all hand scanner operational states. It eliminates scattered boolean flags and enforces deterministic entry and exit conditions.

---

## 2. The 16 Canonical States

```
 ┌──────────────┐
 │ INITIALIZING │
 └──────┬───────┘
        ├──────────────────────────────────┐
        ▼                                  ▼
┌────────────────────────────┐    ┌───────────────────┐
│ CAMERA_PERMISSION_REQUIRED │    │   CAMERA_READY    │
└─────────────┬──────────────┘    └────────┬──────────┘
              │ Granted                    │
              └────────────────────────────┤
                                           ▼
                                 ┌────────────────────┐
                                 │ SEARCHING_FOR_HAND │◄─────────────┐
                                 └─────────┬──────────┘              │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │ HAND_DETECTED │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │ PALM_ALIGNING │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │ QUALITY_CHECK │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │  STABILIZING  │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │     READY     │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │   COUNTDOWN   │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │   CAPTURING   │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │  PROCESSING   │                 │
                                   └───────┬───────┘                 │
                                           ▼                         │
                                   ┌───────────────┐                 │
                                   │  VALIDATING   │                 │
                                   └───────┬───────┘                 │
                                           ├─────────────────┐       │
                                           ▼                 ▼       │
                                      ┌─────────┐       ┌──────────┐ │
                                      │ SUCCESS │       │  RETAKE  ├─┘
                                      └─────────┘       └──────────┘
```

---

## 3. State Definitions and Transition Rules

| State | Entry Condition | Allowed Next States | Failure / Fallback |
|---|---|---|---|
| `INITIALIZING` | Scanner mounted. | `CAMERA_PERMISSION_REQUIRED`, `CAMERA_READY`, `ERROR` | Hardware error -> `ERROR` |
| `CAMERA_PERMISSION_REQUIRED` | Browser permission not yet granted. | `CAMERA_READY`, `INITIALIZING`, `ERROR` | User denies -> `ERROR` or recovery dialog |
| `CAMERA_READY` | Video stream active and attached. | `SEARCHING_FOR_HAND`, `INITIALIZING`, `ERROR` | Video stream drop -> `ERROR` |
| `SEARCHING_FOR_HAND` | Viewfinder active; no hand contour detected. | `HAND_DETECTED`, `SEARCHING_FOR_HAND`, `CAPTURING`, `INITIALIZING`, `ERROR` | Idle timeout resets guide |
| `HAND_DETECTED` | Contour detected with minimum skin area fraction (> 0.08). | `PALM_ALIGNING`, `QUALITY_CHECK`, `STABILIZING`, `READY`, `SEARCHING_FOR_HAND`, `CAPTURING`, `ERROR` | Hand leaves frame -> `SEARCHING_FOR_HAND` |
| `PALM_ALIGNING` | Hand detected but requires scale or position correction. | `QUALITY_CHECK`, `STABILIZING`, `READY`, `SEARCHING_FOR_HAND`, `HAND_DETECTED`, `CAPTURING`, `ERROR` | Hand leaves frame -> `SEARCHING_FOR_HAND` |
| `QUALITY_CHECK` | Optical lighting and sharpness verification in progress. | `STABILIZING`, `READY`, `PALM_ALIGNING`, `SEARCHING_FOR_HAND`, `CAPTURING`, `RETAKE`, `ERROR` | Blur / glare -> `PALM_ALIGNING` |
| `STABILIZING` | Optical & position criteria satisfied; accumulating stable frames. | `READY`, `STABILIZING`, `QUALITY_CHECK`, `PALM_ALIGNING`, `SEARCHING_FOR_HAND`, `CAPTURING`, `RETAKE`, `ERROR` | Motion jitter -> resets count |
| `READY` | 3 consecutive stable frames verified. | `COUNTDOWN`, `CAPTURING`, `STABILIZING`, `SEARCHING_FOR_HAND`, `ERROR` | Hand moves -> `STABILIZING` |
| `COUNTDOWN` | 2-second steady timer before high-res snapshot. | `CAPTURING`, `SEARCHING_FOR_HAND`, `STABILIZING`, `ERROR` | Hand moves -> resets countdown |
| `CAPTURING` | Camera canvas snapshot taken. | `PROCESSING`, `RETAKE`, `ERROR` | Frame grab fail -> `RETAKE` |
| `PROCESSING` | P5.2 `PalmVisionEngine.analyze()` running. | `VALIDATING`, `SUCCESS`, `RETAKE`, `ERROR` | CV crash -> `ERROR` |
| `VALIDATING` | Verifying major lines and non-color attributes. | `SUCCESS`, `RETAKE`, `ERROR` | Retake decision -> `RETAKE` |
| `SUCCESS` | PalmFeatureModel assembled; transitioning to Quick Report. | `CAMERA_READY`, `SEARCHING_FOR_HAND`, `INITIALIZING` | Re-scan resets state |
| `RETAKE` | Scan rejected by P5.2 `RetakeDecisionEngine`. | `SEARCHING_FOR_HAND`, `PALM_ALIGNING`, `CAPTURING`, `CAMERA_READY`, `INITIALIZING` | User taps retry -> `SEARCHING_FOR_HAND` |
| `ERROR` | Unrecoverable hardware or permissions failure. | `CAMERA_PERMISSION_REQUIRED`, `CAMERA_READY`, `SEARCHING_FOR_HAND`, `INITIALIZING` | Retry camera -> `INITIALIZING` |

---

## 4. Deterministic Invariant Enforcement

Every state transition is validated against `VALID_TRANSITIONS`. Invalid transitions throw a descriptive Error, preventing out-of-order execution, race conditions, or silent corrupt states.
