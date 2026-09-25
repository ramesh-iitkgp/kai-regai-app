# P10 Social Share Cards Specification

## 1. Overview & Aspect Ratios

Kai RegAI allows users to share high-DPI visual summary cards across major social channels without leaking private data:
* **1:1 Square (1080 x 1080 px)**: Optimized for Instagram Feed, WhatsApp, and Twitter/X.
* **4:5 Portrait (1080 x 1350 px)**: Optimized for vertical Instagram feeds and LinkedIn.
* **9:16 Story (1080 x 1920 px)**: Optimized for Instagram Stories, TikTok, and WhatsApp Status.

---

## 2. Card Content & Privacy Safeguards

### Invariants:
1. **Zero PII**: Subject name, email, and user IDs are strictly excluded by default.
2. **Zero Raw Biometrics**: Raw camera photos, skin textures, and raw landmark coordinates are never rendered into social cards.
3. **Single Thematic Statement**: Cards present one verified key theme (e.g., "A Story of Constitutional Vitality") derived directly from P8/P9. No AI can hallucinate clickbait fortunes.
4. **Pre-Share Preview**: Users must visually review the generated card before triggering native share or download.

---

## 3. Web Share API & Download Fallback

`ReportShare.shareCard()` operates via:
1. Native `navigator.share()` with file attachment when supported by modern mobile browsers.
2. Automatic download trigger (`<a download="Kai_RegAI_Story.png">`) if native sharing is unavailable or cancelled.
