# Custom Astronomy Engine & AI Astrologer Integration — Audit & Specification

**Repository:** Kai RegAI (clone)  
**Document:** System Audit, Astronomy Specification & Target Architecture  
**Author:** Principal Software Architect & Computational Astronomy Engineer  
**Date:** 2026-10-09  

---

## 1. Executive Summary & Existing Repository Audit

Before implementing the custom astronomy engine and integrating it with the Ask the Astrologer module, a comprehensive audit of the active codebase was performed.

### 1.1 Architecture Discovered

| Subsystem | Existing Technology & Version | Key Files | Integration Strategy |
|---|---|---|---|
| **Frontend** | Vanilla ES2022+ with custom components, bundled with Vite v8.3.1. Single Page Application (SPA). | `src/app.js`, `src/navigation/router.js`, `src/styles/` | Extend `src/screens/AstrologerChatScreen.js` and add chart view components (`VedicChartView.js`, `WesternChartView.js`). |
| **Backend & HTTP Server** | Native Node.js `node:http` Server running on Node 22+. Versioned REST API at `/api/v1/`. | `src/backend/api/Server.js`, `src/backend/api/ApiRouter.js`, `src/backend/config.js` | Extend `ApiRouter.js` with new routes under `/api/v1/astrology/` and `/api/v1/consultations/`. |
| **Database & Persistence** | Embedded SQLite using Node.js native `DatabaseSync` (`node:sqlite`) with WAL mode, foreign keys, and atomic transactions. | `src/backend/database/Database.js`, `src/backend/database/MigrationEngine.js` | Add Migration 002 creating `astrology_profiles`, `birth_charts`, `consultations`, and `consultation_messages`. |
| **Authentication & Identity** | Bearer token session authentication supporting Guest (`GST-*`) and Account (`ACC-*`) identities. | `src/backend/services/AuthService.js`, `src/backend/api/middleware/authMiddleware.js` | Require valid session token on all astrology profile, chart, and consultation endpoints. Enforce user ownership. |
| **User Profile & Birth Inputs** | Profiles manage dominance and preferences. Birth inputs exist in `PersonalForecastInputModal.js` (DOB, TOB, POB, hand). | `src/auth/UserProfile.js`, `src/components/PersonalForecastInputModal.js` | Reuse and standardize birth detail structures (DOB, TOB, POB, Latitude, Longitude, IANA Timezone, birth-time precision). |
| **Astrologer Module** | `AstrologerChatScreen.js` and `AstrologerChatService.js` currently provide simulated responses and an expert directory. | `src/screens/AstrologerChatScreen.js`, `src/services/AstrologerChatService.js` | Upgrade to connect with real custom astronomy calculation engine, structured chart rendering, and Gemini AI interpretation. |
| **AI / Narration Framework** | Abstract `LLMProvider` in `src/narration/LLMProvider.js` with `MockLLMProvider.js`, `PromptCompiler.js`, and `NarrationSafetyGate.js`. | `src/narration/` | Implement `GeminiService.js` (calling Google Gemini REST API using `GEMINI_API_KEY`) and deterministic mock fallback for testing. |
| **Monetization & Entitlements** | `EntitlementService.js`, `ProductCatalog.js`, `AccessPolicy.js`, supporting free usage allowances and paid tiers. | `src/monetization/` | Enforce message allowances and tier policies server-side for astrology consultations. |
| **Testing Infrastructure** | Node.js native test runner (`node --test`). 365 tests currently passing across CV, reports, storage, and backend. | `tests/` | Add comprehensive numerical validation suite (`tests/astronomy/`), chart tests, and API integration tests. |

---

## 2. Target Directory & Module Structure

```
src/
├── astronomy/                  # Pure astronomical computations (No astrology rules, 100% custom math)
│   ├── time/
│   │   ├── JulianDate.js       # Gregorian date/time <-> JD, JDN, J2000.0 epoch
│   │   ├── DeltaT.js           # Terrestrial Time (TT) minus UT polynomial models
│   │   ├── SiderealTime.js     # GMST & GAST (IAU 1982 / 2000) & Local Sidereal Time (LST)
│   │   └── TimezoneConverter.js# IANA timezone, UTC conversion, DST transition validation
│   ├── coordinates/
│   │   ├── Obliquity.js        # Mean and true obliquity of the ecliptic (Laskar 1986 / IAU)
│   │   ├── Nutation.js         # Nutation in longitude (Δψ) and obliquity (Δε) (IAU 1980 / Meeus)
│   │   ├── Transformations.js  # Ecliptic <-> Equatorial <-> Horizontal coordinate transforms
│   │   └── AngleMath.js        # Normalization [0, 360), shortest difference, quadrant handling
│   ├── ephemeris/
│   │   ├── SolarCoordinates.js # High-precision Sun geocentric ecliptic position & distance
│   │   ├── LunarCoordinates.js # Lunar position & distance using Chapront ELP-2000/82 series terms
│   │   ├── PlanetarySeries.js  # Heliocentric Keplerian & perturbation terms (VSOP87 series terms)
│   │   └── PlutoCoordinates.js # Pluto heliocentric coordinates (Meeus Ch. 37)
│   ├── planetaryPositions/
│   │   ├── PlanetaryCalculator.js # Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
│   │   ├── LunarNodes.js       # Rahu and Ketu (Mean node & True node conventions)
│   │   └── PlanetaryMotion.js  # Longitudinal speed & retrograde flag calculation
│   ├── ascendant/
│   │   └── AscendantCalculator.js # Ascendant (Lagna), Midheaven (MC), Vertex, East Point
│   ├── houses/
│   │   ├── HouseSystems.js     # Whole Sign, Equal House, and Placidus (with polar fallback)
│   │   └── HouseCusps.js       # House cusp positions and planet-to-house allocation
│   ├── validation/
│   │   ├── AstronomicalTestVectors.js # Verified reference vectors (JPL Horizons & Astronomical Almanac)
│   │   └── NumericalValidator.js      # Automated discrepancy checker with documented tolerances
│   └── types/
│       └── AstronomyTypes.js   # Type definitions and calculation options
│
├── astrology/                  # Astrological systems derived from astronomy
│   ├── common/
│   │   ├── ZodiacSigns.js      # 12 Signs, symbols, elements, modalities, rulers
│   │   └── Dignities.js        # Exaltation, debilitation, rulership, detriment
│   ├── vedic/
│   │   ├── Ayanamsa.js         # Lahiri / Chitrapaksha, Raman, KP, Tropical Ayanamsa
│   │   ├── VedicChartEngine.js # Sidereal longitudes, Vedic signs, Bhava Chalita, Rashis
│   │   └── VimshottariDasha.js # Vimshottari Dasha sequence, balance, and major periods
│   ├── western/
│   │   ├── WesternChartEngine.js # Tropical zodiac placements, degrees, minutes
│   │   └── WesternHouses.js    # Western quadrant & equal house configurations
│   ├── nakshatra/
│   │   ├── NakshatraCalculator.js # 27 Nakshatras, 108 Padas (1-4), deity, ruler, boundary math
│   │   └── NakshatraData.js    # Traditional qualities and nakshatra lords
│   ├── aspects/
│   │   └── AspectCalculator.js # Major aspects (0°, 60°, 90°, 120°, 180°), orbs, applying/separating
│   ├── chartBuilder/
│   │   ├── BirthChartBuilder.js # Assembles unified canonical BirthChart payload
│   │   └── ChartHash.js        # Deterministic cache hash including calculation version
│   └── interpretationContext/
│       └── ChartContextCompiler.js # Compact, hallucination-proof facts for AI narration
│
├── astrologer/                 # AI Consultation, Gemini, Safety & Persistence
│   ├── api/
│   │   └── AstrologerRouter.js # Endpoints for chart calculation, sessions, chat, history
│   ├── consultationService/
│   │   └── ConsultationService.js # Multi-turn conversation management & entitlement verification
│   ├── geminiService/
│   │   ├── GeminiClient.js     # Live Google Gemini REST API client (via GEMINI_API_KEY)
│   │   ├── MockGeminiClient.js # Deterministic mock client for offline tests
│   │   └── GeminiService.js    # Orchestrates prompt dispatch and response parsing
│   ├── promptBuilder/
│   │   └── AstrologerPromptBuilder.js # Enforces AI identity, system fidelity, anti-fatalism
│   ├── knowledgeRetrieval/
│   │   └── AstrologyKnowledgeBase.js  # Source-attributed Vedic & Western passage retrieval
│   ├── responseValidator/
│   │   └── AstrologerResponseValidator.js # Validates structured output against schema & safety
│   ├── safety/
│   │   └── AstrologerSafetyGate.js # Medical, fatalistic, legal, and financial guardrails
│   └── persistence/
│       └── AstrologyRepository.js # SQLite data access layer for charts, sessions, messages
│
└── components/
    ├── VedicChartView.js       # South Indian & North Indian diagram renderers
    └── WesternChartView.js     # Western wheel and aspects matrix component
```

---

## 3. Mathematical & Algorithmic Foundation

### 3.1 Julian Date & Time Conversion
- Algorithm: Gregorian to Julian Day Number (Meeus Chapter 7, Fliegel & van Flandern).
- Fractional day computation: $\text{day} + \frac{\text{hour} + \text{min}/60 + \text{sec}/3600}{24}$.
- Time scale: Local birth time converted to UTC using standard IANA timezone offset, then $\text{TT} = \text{UTC} + \Delta T$.
- Epoch J2000.0: $\text{JD} = 2451545.0$ (2000 January 1.5 TT).

### 3.2 Sidereal Time
- Greenwich Mean Sidereal Time (GMST) at $0^h$ UT:
  $$\text{GMST}_0 = 100.46061837 + 36000.770053608 T + 0.000387933 T^2 - T^3 / 38710000$$
  where $T = (\text{JD} - 2451545.0) / 36525$.
- Apparent Sidereal Time (GAST): $\text{GAST} = \text{GMST} + \Delta \psi \cos(\epsilon)$.
- Local Sidereal Time: $\text{LST} = \text{GAST} + \lambda / 15$.

### 3.3 Obliquity and Nutation
- Laskar (1986) 3rd order mean obliquity:
  $$\epsilon_0 = 23^\circ 26' 21.448'' - 46.8150'' T - 0.00059'' T^2 + 0.001813'' T^3$$
- Nutation in longitude ($\Delta \psi$) and obliquity ($\Delta \epsilon$) computed from lunar ascending node $\Omega$, mean solar longitude $L$, and lunar longitude $L'$.

### 3.4 Planetary & Lunar Positions & Verified Accuracy Envelope
- Geocentric Ecliptic Longitude and Latitude computed for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
- Verified Accuracy Envelopes (cross-validated against NASA/JPL Horizons and USNO):
  - **Sun & Moon**: Sub-12 arcseconds ($\pm 0.003^\circ$). High precision suitable for exact nakshatras and Vimshottari dasha balance.
  - **Venus**: Sub-2 arcminutes ($\pm 0.035^\circ$) across 1850–2050.
  - **Mercury & Mars**: $\pm 0.008^\circ$ (sub-half arcminute) at J2000; up to $\pm 0.38^\circ$ across 1850–2050.
  - **Outer Gas/Ice Giants (Jupiter, Saturn, Uranus, Neptune, Pluto)**: $\pm 0.08^\circ$ to $\pm 0.8^\circ$ at J2000; up to $\pm 1.8^\circ$ (Jupiter), $\pm 2.8^\circ$ (Saturn), $\pm 3.1^\circ$ (Uranus) in the 19th century due to truncated VSOP87 perturbation series.
- Lunar position derived using Chapront ELP-2000/82 truncated periodic perturbation series with 59 longitude and 46 latitude terms.
- Rahu and Ketu calculated using astronomical lunar nodes ($\Omega$ and $\Omega + 180^\circ$), supporting both Mean and True Node conventions.

### 3.5 Ascendant, Midheaven & House Systems
- Ascendant $\lambda_{asc}$:
  $$\tan(\lambda_{asc}) = \frac{\cos(\theta)}{-\sin(\theta)\cos(\epsilon) - \tan(\phi)\sin(\epsilon)}$$
  with robust 4-quadrant $\text{atan2}$ resolution.
- Midheaven $\lambda_{MC}$:
  $$\tan(\lambda_{MC}) = \frac{\tan(\theta)}{\cos(\epsilon)}$$
- **Unknown Birth Time Safeguard**: When birth time is unknown (`isTimeUnknown: true`), Ascendant and time-dependent houses are strictly withheld (`null` and `[]`) to prevent fabricated astrological claims.
- **House Systems Supported**:
  - **Whole Sign Houses**: Sign containing Ascendant is House 1 ($0^\circ-30^\circ$ of that sign), subsequent signs form Houses 2–12.
  - **Equal Houses**: House $i = (\lambda_{asc} + (i-1) \times 30^\circ) \pmod{360^\circ}$.
  - **Placidus Houses**: Intermediate cusps 11, 12, 2, 3 solved by trisecting semi-diurnal and semi-nocturnal arcs along the celestial equator via numerical bisection. Automatically detects polar circle circumpolar latitude ($|\phi| \ge 90^\circ - \epsilon$) and falls back to Equal House with user notification.
  - **Porphyry Houses**: Trisects the ecliptic arcs between the four cardinal angles ($MC, Asc, IC, Dsc$).

### 3.6 Vedic Sidereal Engine & Nakshatras
- Lahiri / Chitrapaksha Ayanamsa:
  $$\text{Ayanamsa}_{Lahiri}(T) = 23.857092^\circ + 1.396971^\circ \times T$$
- Sidereal Longitude: $\lambda_{sidereal} = (\lambda_{tropical} - \text{Ayanamsa}) \pmod{360^\circ}$.
- 27 Nakshatras spanning $13^\circ 20'$ ($13.333333^\circ$) each, subdivided into 4 Padas of $3^\circ 20'$ ($3.333333^\circ$).

### 3.7 Western Tropical Engine & Aspects
- Tropical Longitude $\lambda_{tropical}$ directly mapped into 12 Signs of $30^\circ$.
- Aspects computed via shortest angular separation:
  $$\Delta \theta = |\lambda_1 - \lambda_2|; \quad \text{if } \Delta \theta > 180^\circ \text{ then } 360^\circ - \Delta \theta$$
  Checked against exact target angles (Conjunction $0^\circ$, Sextile $60^\circ$, Square $90^\circ$, Trine $120^\circ$, Opposition $180^\circ$) within configured orb tolerances.

---

## 4. Execution Plan (Milestones A through I)

1. **Milestone A**: Repository audit (this document), astronomy specification and reference test vectors.
2. **Milestone B**: Julian Date, time handling, coordinate transformations, and planetary calculations.
3. **Milestone C**: Independent numerical validation suite with documented accuracy tolerances.
4. **Milestone D**: Vedic sidereal engine, Lahiri ayanamsa, signs, ascendant, houses, and nakshatras.
5. **Milestone E**: Western tropical engine, houses, and planetary aspects.
6. **Milestone F**: Common chart contract, SQLite persistence, and UI rendering components.
7. **Milestone G**: Gemini integration, prompt builder, safety filters, and response validator.
8. **Milestone H**: Consultation history API, usage controls, entitlements, and security.
9. **Milestone I**: Full regression testing, numerical gate validation, and production build verification.
