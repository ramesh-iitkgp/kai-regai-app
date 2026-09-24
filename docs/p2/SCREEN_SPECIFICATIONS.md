# Kai RegAI — Detailed Screen Specifications

This specification establishes the functional and interaction requirements for the core screens in the Kai RegAI inventory.

---

## 1. `SCR-HOM-001`: Home Hub Screen

* **screen_id**: `SCR-HOM-001`
* **screen_name**: Home Hub
* **purpose**: Main destination presenting the two core reading modes, recent reading snippet, and daily reflection.
* **entry_points**: Cold launch after onboarding; bottom tab navigation `Home` tab.
* **exit_points**: Mode 1 Scanner modal; Mode 2 Palm Reading modal; Reading Detail viewer; Profile.
* **primary_action**: Tap **"Hand Scanner (~10s)"** hero card (`Launch Mode 1`).
* **secondary_actions**: Tap **"Guided Palm Reading"** hero card (`Launch Mode 2`); tap "Recent Reading" card; tap "Learn Article".
* **data_required**: User profile name, dominant hand setting, most recent reading session record, daily wisdom record.
* **data_created**: None (read-only hub).
* **states**:
  * `DEFAULT`: Shows both hero cards and recent reading card.
  * `EMPTY_NO_READINGS`: Recent reading card replaced with *"Take your first palm reading today"* onboarding prompt.
* **accessibility**: Large tap targets ($\ge 48\times 48\text{ pt}$); accessibility labels on hero cards (*"Launch Hand Scanner, approximately 10 seconds"* and *"Launch Guided Palm Reading, in-depth multi-minute reflection"*).
* **design_notes**: Deep obsidian background (`#0A0A12`), subtle warm gold accent (`#F59E0B`), elevated glass cards (`#141424`). The trailing "AI" in "RegAI" header features distinctive glowing cyan gradient.

---

## 2. `SCR-SCN-001`: Scanner Viewfinder & HUD

* **screen_id**: `SCR-SCN-001`
* **screen_name**: Mode 1 Scanner Viewfinder
* **purpose**: Real-time camera viewfinder that guides palm placement, verifies image quality, and executes the 10-second progressive line analysis sweep.
* **entry_points**: Tapped "Hand Scanner" on Home; deep link `kairegai://scanner`.
* **exit_points**: Quick Report Card (`SCR-SCN-002`) on success; dismissal button back to Home.
* **primary_action**: Automatic scan trigger once Quality Halo turns solid green; manual fallback scan button.
* **secondary_actions**: Flip camera (rear vs front camera, default rear); toggle torch/flashlight; dismiss/cancel.
* **data_required**: Active camera stream, real-time landmark pipeline.
* **data_created**: Transient `PalmFeatureModel` (JSON).
* **states** (Consolidated within screen):
  * `CAMERA_SEARCHING`: Viewfinder active with subtle pulsating holographic hand silhouette.
  * `WARNING_HAND_TOO_FAR`: HUD badge: *"Move closer"* with contracting guide arrows.
  * `WARNING_LOW_LIGHT`: HUD badge: *"Low light — seek gentle illumination"* with torch button pulsing.
  * `WARNING_HAND_TILTED`: HUD badge: *"Align palm vertically"*.
  * `WARNING_DORSAL_HAND`: HUD badge: *"Turn palm toward camera"*.
  * `QUALITY_HALO_GREEN`: Circular indicator flares green $\rightarrow$ triggers countdown.
  * `SCANNING_BEAM_ACTIVE`: Horizontal laser beam sweeps vertically down palm (Sec 0–3).
  * `ANALYSIS_PROGRESSIVE_GLOWS`: Lines ignite sequentially:
    * Life: **Violet** (`#A855F7`)
    * Head: **Blue** (`#00D2FF`)
    * Heart: **Rose** (`#F43F5E`)
    * Fate: **Gold** (`#FBBF24`)
    * Sun: **Amber** (`#F59E0B`)
  * `ANALYSIS_CONSOLIDATING`: Final haptic tick; transitions to `SCR-SCN-002`.
* **errors**: `CAMERA_PERMISSION_DENIED`, `HARDWARE_CAMERA_FAILURE`, `ANALYSIS_TIMEOUT` (handled via in-screen retry banner).
* **design_notes**: Fullscreen camera preview with frosted glass controls at bottom. Visual guidance is high-contrast and non-obstructive.

---

## 3. `SCR-SCN-002`: Quick Report Card

* **screen_id**: `SCR-SCN-002`
* **screen_name**: Quick Report Presentation Card
* **purpose**: Deliver immediate, visually stunning reading card with illuminated lines, top 3 traits, and reflective prompt.
* **entry_points**: Completed scan from `SCR-SCN-001`.
* **exit_points**: Dismiss back to Home; tap *"Explore Full Guided Reading"* (launches Mode 2); tap *"Share"*.
* **primary_action**: Tap *"Explore Full Guided Reading"* (passes current baseline scan into Mode 2).
* **secondary_actions**: Tap *"Save & Exit"*; tap *"Share Card"*; 3D tilt gesture to inspect palm overlay.
* **data_required**: `PalmFeatureModel`, matched Quick Interpretation traits from Rule Engine.
* **data_created**: Saved reading record in `ReadingsArchive`.
* **states**:
  * `CARD_REVEAL`: Elegant card flip animation from palm scan to reading card.
  * `DEFAULT_INSPECT`: Interactive gyroscope-responsive tilt card with illuminated line layers.
* **accessibility**: All 3 traits read by voiceover with clear semantic descriptors; line highlights paired with explicit text labels.
* **design_notes**: Card features glowing border reflecting dominant line color; share button generates square 1080x1080 image card for Instagram/WhatsApp.

---

## 4. `SCR-PLM-001`: Hand Context Selector (Mode 2 Primer)

* **screen_id**: `SCR-PLM-001`
* **screen_name**: Hand Context Selector
* **purpose**: Orient user on the significance of the Dominant vs Passive hand and establish reading focus.
* **entry_points**: Tapped "Palm Reading" on Home; tapped "Explore Full Guided Reading" from Quick Report.
* **exit_points**: Proceed to Baseline Capture (`SCR-PLM-002`); cancel back to Home.
* **primary_action**: Tap *"Continue with Dominant Right Hand"* (or Left Hand).
* **secondary_actions**: Toggle hand dominance; select primary life inquiry (*"General Life Path"*, *"Career & Calling"*, *"Relationships & Heart"*).
* **data_required**: Saved user preference for dominant hand (default right).
* **data_created**: `ReadingSession.hand_side`, `ReadingSession.reading_focus`.
* **design_notes**: Minimalist twin-hand illustration explaining Vedic concept: Passive hand reflects innate blueprint; Dominant hand reflects current evolution.

---

## 5. `SCR-PLM-003`: Guided 5-Module Questionnaire

* **screen_id**: `SCR-PLM-003`
* **screen_name**: Guided Questionnaire
* **purpose**: Collect tactile, muscular, and subtle features that 2D cameras cannot discern, using interactive visual widgets.
* **entry_points**: Baseline capture passed from `SCR-PLM-002`.
* **exit_points**: Synthesis Transition (`SCR-PLM-004`); cancel session with confirmation dialog.
* **primary_action**: Select option $\rightarrow$ auto-advances to next question with subtle haptic tap.
* **secondary_actions**: Tap *"Previous Question"*; tap *"Skip this question"*; tap *"Why we ask this"* tooltip.
* **data_required**: Verified baseline features from `SCR-PLM-002`.
* **data_created**: `UserPalmObservations` JSON object.
* **states** (Wired sequentially inside container):
  1. `STEP_PAD_FIRMNESS`: 3D interactive silicone-style pad button (`ELASTIC`, `FIRM`, `SOFT`).
  2. `STEP_THUMB_ARC`: Vector thumb graphic bending dynamically as user drags radial slider ($0^\circ - 45^\circ+$).
  3. `STEP_PHALANX_RATIO`: Balance scale widget comparing Top Will vs Middle Logic segment.
  4. `STEP_FINGER_RATIO`: Side-by-side silhouette slider comparing Index vs Ring finger alignment.
  5. `STEP_SACRED_SIGNS`: Carousel of high-contrast illustrated glyph cards (*Fish*, *Trident*, *Mystic Cross*, *Protection Square*).
* **accessibility**: Every widget supports standard stepper/slider VoiceOver controls; full verbal descriptions of illustrations provided.
* **design_notes**: Progress bar at top displaying 5 steps. Smooth horizontal slide transitions between questions.

---

## 6. `SCR-PLM-005`: Detailed Palm Dossier

* **screen_id**: `SCR-PLM-005`
* **screen_name**: Detailed Palm Dossier
* **purpose**: Multi-chapter interactive reading report covering all life domains, line maps, and traditional citations.
* **entry_points**: Completed synthesis from `SCR-PLM-004`; opened from `SCR-RDG-001`.
* **exit_points**: Exit back to Readings; tap *"Export PDF"*; tap *"Share Highlights"*.
* **primary_action**: Scroll through chapters or tap chapter pill tabs (`Overview`, `Heart`, `Mind`, `Vitality`, `Destiny`).
* **secondary_actions**: Tap a highlighted line to view traditional citation in Learn Library; toggle between Vedic perspective and Western analysis.
* **data_required**: Full `PalmReport` payload including narrative chapters, line confidence scores, and literature citations.
* **data_created**: Exported PDF file or shared summary image.
* **states**:
  * `CHAPTER_OVERVIEW`: Executive summary, elemental constitutional badge, archetype title.
  * `CHAPTER_DETAIL`: Deep prose narrative with pull-quotes, traditional term chips (*Pitri Rekha*, *Guru Parvata*), and reflective questions.
* **design_notes**: Editorial, luxury book aesthetic. High typographic contrast with warm gold accents. Expandable *"Tradition Notes"* accordions at the bottom of each chapter.
