# Kai RegAI — User Journeys Specification

## 1. Journey Overview & Target Personas

Kai RegAI serves three core user intentions across distinct contexts:
1. **The Curious Explorer (Casual / First-Time)**: Wants immediate visual delight, fast gratification, and a zero-friction introduction to palm reading.
2. **The Mindful Inquirer (Deep Personal Reflection)**: Seeks introspective guidance, relationship insights, and authentic Vedic and classical perspective.
3. **The Heritage Student (Cultural / Educational)**: Enjoys learning the history of *Hasta Samudrika* and comparing hand signs.

---

## 2. Journey 1: First-Launch Experience (20–30 Second Onboarding)

* **Objective**: Introduce brand identity, clarify the two modes, obtain camera consent with high trust, and guide the user into their first reading.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Splash as SCR-ONB-001 (Splash)
    participant Value as SCR-ONB-002 (Value Prop)
    participant Perm as SCR-ONB-003 (Camera Rationale)
    participant Home as SCR-HOM-001 (Home)
    participant Scanner as SCR-SCN-001 (Hand Scanner)

    User->>Splash: Opens app for first time
    Splash->>Splash: Ethereal obsidian-gold animation (1.5s)
    Splash->>Value: Auto-transitions or tap to proceed
    Value->>User: Displays "Ancient Indian Wisdom × Modern AI"
    Value->>User: Presents "Hand Scanner (~10s)" vs "Deep Reading"
    User->>Value: Taps "Try Quick 10-Second Scan"
    Value->>Perm: Displays Camera Privacy Rationale Card
    Note over Perm,User: "Camera is used in real-time on your device.<br/>Photos are never uploaded or stored without consent."
    User->>Perm: Taps "Enable Camera & Continue"
    Perm->>Scanner: Opens Camera Viewfinder directly
    Scanner->>User: Silhouette guidance: "Hold dominant palm steady"
```

* **First-Time Drop-off Mitigation**: If the user skips the initial scan, they land directly on the Home Screen with both reading hero cards prominent.

---

## 3. Journey 2: Mode 1 Hand Scanner (~10-Second Experience)

* **Context**: User on the move, at a gathering, or performing their daily reflective check-in.

```mermaid
journey
    title Mode 1 Hand Scanner (~10 Seconds)
    section Camera Alignment
      Tap 'Hand Scanner' on Home: 5: User
      Viewfinder opens with holographic hand silhouette: 5: App
      Position palm within boundary guides: 4: User
      Green halo illuminates as quality metrics clear: 5: App
    section Scanning Choreography
      Luminous laser sweep moves across palm (Sec 0-3): 5: App
      Life Line flares in Violet (Sec 3-5): 5: App
      Head Line flares in Blue, Heart Line in Rose (Sec 5-7): 5: App
      Fate & Sun Lines illuminate in Gold & Amber (Sec 7-9): 5: App
      Gentle haptic pulse signifies scan completion: 5: App
    section Insight Delivery
      Interactive 3D Quick Report Card appears: 5: App
      User reviews top 3 archetypal traits: 4: User
      User saves or shares card: 5: User
```

---

## 4. Journey 3: Mode 2 Guided Palm Reading (2–5 Minutes)

* **Context**: User in a calm, contemplative environment exploring life transitions, relationship dynamics, or career pathing.

```mermaid
graph TD
    Start[Tap 'Palm Reading' Hero on Home] --> Step1[Select Dominant Hand & Purpose]
    Step1 --> Step2[Capture Steady Baseline Palm Photo]
    Step2 --> QualityCheck{Quality Gate Passed?}
    QualityCheck -- No --> Retake[Visual Feedback: Improve lighting / Adjust distance] --> Step2
    QualityCheck -- Yes --> Step3[Module 1: Venus Pad Firmness Tactile Test]
    Step3 --> Step4[Module 2: Thumb Flexibility Radial Arc Meter]
    Step4 --> Step5[Module 3: Thumb Will vs Logic Phalanx Gauge]
    Step5 --> Step6[Module 4: Index vs Ring Finger Length Comparator]
    Step6 --> Step7[Module 5: Sacred Signs Confirmation Carousel]
    Step7 --> SynthesisHUD[Synthesis HUD: Matching Rules & Trad. Citations]
    SynthesisHUD --> ReportView[Interactive Multi-Chapter Palm Dossier]
    ReportView --> ExportPDF[Export Styled PDF Dossier]
```

---

## 5. Journey 4: Reading History & Bilateral Comparison

* **Context**: User revisiting previous readings to reflect on personal evolution or compare the dominant (active) hand with the passive (innate) hand.

```
[Open Readings Tab]
        │
        ▼
[Readings Timeline List: Sorted by Date & Hand Type]
        │
        ├── Select Single Reading ──> Opens Full Report Viewer
        │
        └── Tap "Compare Hands" ────> Launches Bilateral Comparator:
                                      • Left (Innate Blueprint) vs Right (Active Trajectory)
                                      • Highlights divergence in Head Line & Fate Line
                                      • Summarizes conscious growth vs latent potential
```
