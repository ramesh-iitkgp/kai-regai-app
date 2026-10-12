/**
 * Independent Astronomical Verification & Audit Test Harness
 * 
 * Executes cross-verification against NASA/JPL Horizons and USNO reference vectors,
 * audits all calculation modules, verifies Vedic and Western chart generation,
 * exercises API persistence & authorization, tests AI grounding, and checks regressions.
 */

import http from 'node:http';
import { gregorianToJD, jdToGregorian, jdToJulianCenturies, J2000_EPOCH } from '../../src/astronomy/time/JulianDate.js';
import { estimateDeltaT, utToTT } from '../../src/astronomy/time/DeltaT.js';
import { getGMST, getGAST, getLST } from '../../src/astronomy/time/SiderealTime.js';
import { getTimezoneOffsetHours, normalizeBirthTime } from '../../src/astronomy/time/TimezoneConverter.js';
import { normalizeDegrees, normalizeDegreesSigned, angularDifference, degToDms } from '../../src/astronomy/coordinates/AngleMath.js';
import { calculateNutation } from '../../src/astronomy/coordinates/Nutation.js';
import { getMeanObliquity, getTrueObliquity } from '../../src/astronomy/coordinates/Obliquity.js';
import { eclipticToEquatorial, equatorialToEcliptic, equatorialToHorizontal } from '../../src/astronomy/coordinates/Transformations.js';
import { calculateSolarCoordinates } from '../../src/astronomy/ephemeris/SolarCoordinates.js';
import { calculateLunarCoordinates } from '../../src/astronomy/ephemeris/LunarCoordinates.js';
import { calculatePlutoCoordinates } from '../../src/astronomy/ephemeris/PlutoCoordinates.js';
import { calculateMeanLunarNodes, calculateTrueLunarNodes } from '../../src/astronomy/planetaryPositions/LunarNodes.js';
import { calculateBodyPosition, calculateAllPlanetaryPositions } from '../../src/astronomy/planetaryPositions/PlanetaryCalculator.js';
import { calculateAscendantAndAngles } from '../../src/astronomy/ascendant/AscendantCalculator.js';
import { calculateWholeSignHouses, calculateEqualHouses, calculatePlacidusHouses, determineHouseForLongitude } from '../../src/astronomy/houses/HouseSystems.js';
import { calculateAyanamsa, tropicalToSidereal, siderealToTropical } from '../../src/astrology/vedic/Ayanamsa.js';
import { calculateNakshatra } from '../../src/astrology/nakshatra/NakshatraCalculator.js';
import { NAKSHATRAS, NAKSHATRA_SPAN_DEG, PADA_SPAN_DEG } from '../../src/astrology/nakshatra/NakshatraData.js';
import { calculateVimshottariDasha, DASHA_ORDER } from '../../src/astrology/vedic/VimshottariDasha.js';
import { calculateVedicChart } from '../../src/astrology/vedic/VedicChartEngine.js';
import { calculateWesternChart } from '../../src/astrology/western/WesternChartEngine.js';
import { calculateAspects, getAngularSeparation, determineAspectDirection } from '../../src/astrology/aspects/AspectCalculator.js';
import { buildBirthChart, generateInputHash, CURRENT_CALCULATION_VERSION } from '../../src/astrology/chartBuilder/BirthChartBuilder.js';
import { defaultKnowledgeBase } from '../../src/astrologer/knowledgeRetrieval/AstrologyKnowledgeBase.js';
import { defaultSafetyGate } from '../../src/astrologer/safety/AstrologerSafetyGate.js';
import { AstrologerPromptBuilder } from '../../src/astrologer/promptBuilder/AstrologerPromptBuilder.js';
import { AstrologerResponseValidator } from '../../src/astrologer/responseValidator/AstrologerResponseValidator.js';
import { ConsultationService } from '../../src/astrologer/consultationService/ConsultationService.js';
import { AstrologyRepository } from '../../src/astrologer/persistence/AstrologyRepository.js';
import { DatabaseSync } from 'node:sqlite';
import { MigrationEngine } from '../../src/backend/database/MigrationEngine.js';

// Query NASA/JPL Horizons API for Observer Ecliptic Longitude
async function queryHorizonsEcliptic(command, startUtc, stopUtc) {
  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${command}'&EPHEM_TYPE='OBSERVER'&CENTER='500@399'&START_TIME='${encodeURIComponent(startUtc)}'&STOP_TIME='${encodeURIComponent(stopUtc)}'&STEP_SIZE='1d'&QUANTITIES='31'&REF_SYSTEM='ICRF'&REF_PLANE='ECLIPTIC'`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const result = data.result || '';
    const soeIdx = result.indexOf('$$SOE');
    const eoeIdx = result.indexOf('$$EOE');
    if (soeIdx === -1 || eoeIdx === -1) {
      return null;
    }
    const lines = result.slice(soeIdx + 5, eoeIdx).trim().split('\n');
    const firstLine = lines[0].trim();
    // Format: YYYY-Mon-DD HH:MM  ObsEcl-Lon  ObsEcl-Lat
    // e.g., 2000-Jan-01 12:00     280.3689092   0.0002381
    const tokens = firstLine.split(/\s+/);
    // Find numeric token for Longitude
    for (let i = 2; i < tokens.length; i++) {
      const num = parseFloat(tokens[i]);
      if (!isNaN(num) && num >= 0 && num < 360) {
        return {
          dateStr: `${tokens[0]} ${tokens[1]}`,
          longitude: num,
          latitude: parseFloat(tokens[i + 1]) || 0
        };
      }
    }
    return null;
  } catch (err) {
    console.warn(`Horizons query error for ${command}:`, err.message);
    return null;
  }
}

async function runIndependentAudit() {
  console.log('===============================================================');
  console.log('   KAI REGAI ASTRONOMY & ASTROLOGY INDEPENDENT AUDIT HARNESS   ');
  console.log('===============================================================');

  const auditReport = {
    timestamp: new Date().toISOString(),
    phases: {},
    summary: { totalChecks: 0, passed: 0, failed: 0, notVerified: 0 }
  };

  function recordCheck(phase, name, status, details = {}) {
    auditReport.summary.totalChecks++;
    if (status === 'PASS') auditReport.summary.passed++;
    else if (status === 'FAIL') auditReport.summary.failed++;
    else auditReport.summary.notVerified++;

    if (!auditReport.phases[phase]) auditReport.phases[phase] = [];
    auditReport.phases[phase].push({ name, status, ...details });
    console.log(`[${status}] [${phase}] ${name}`);
  }

  // =========================================================================
  // PHASE 2 — INDEPENDENT ASTRONOMICAL CROSS-VERIFICATION
  // =========================================================================
  console.log('\n--- EXECUTING PHASE 2: INDEPENDENT ASTRONOMICAL BENCHMARKS ---');

  // Test Case A — Julian Date & USNO comparison
  const jdJ2000 = gregorianToJD(2000, 1, 1, 12, 0, 0);
  const diffJ2000 = Math.abs(jdJ2000 - 2451545.0);
  recordCheck('Phase 2', 'Julian Date J2000.0 (2000-01-01 12:00:00 TT)', diffJ2000 < 1e-7 ? 'PASS' : 'FAIL', {
    calculated: jdJ2000,
    expected: 2451545.0,
    discrepancyDays: diffJ2000
  });

  // Calendar round-trip
  const calRound = jdToGregorian(2451545.0);
  const roundTripPass = calRound.year === 2000 && calRound.month === 1 && calRound.day === 1 && calRound.hour === 12;
  recordCheck('Phase 2', 'Julian Date Round-Trip (JD 2451545.0 -> Gregorian)', roundTripPass ? 'PASS' : 'FAIL', {
    calculated: calRound,
    expected: { year: 2000, month: 1, day: 1, hour: 12 }
  });

  // Leap Year Century: 2000 Feb 29 12:00
  const jdLeap = gregorianToJD(2000, 2, 29, 12, 0, 0);
  recordCheck('Phase 2', 'Julian Date Leap Year 2000-02-29 12:00:00', Math.abs(jdLeap - 2451604.0) < 1e-7 ? 'PASS' : 'FAIL', {
    calculated: jdLeap,
    expected: 2451604.0
  });

  // Midnight / Noon boundary check
  const jdMidnight = gregorianToJD(2000, 1, 1, 0, 0, 0);
  const jdNoon = gregorianToJD(2000, 1, 1, 12, 0, 0);
  recordCheck('Phase 2', 'Midnight to Noon Step (exactly 0.5 days)', Math.abs((jdNoon - jdMidnight) - 0.5) < 1e-7 ? 'PASS' : 'FAIL', {
    jdMidnight,
    jdNoon,
    diff: jdNoon - jdMidnight
  });

  // Test Case B — Solar Position (1992-10-13 00:00:00 TD/TT)
  const jdSunTest = gregorianToJD(1992, 10, 13, 0, 0, 0); // 2448908.5
  const calcSun = calculateSolarCoordinates(jdSunTest);
  // Meeus Ex 25.a gives apparent longitude = 199.906°
  const sunHorizons = await queryHorizonsEcliptic('10', '1992-10-13 00:00', '1992-10-13 00:01');
  const sunTarget = sunHorizons ? sunHorizons.longitude : 199.906;
  const sunDiffDeg = angularDifference(calcSun.apparentLongitude, sunTarget);
  const sunDiffArcsec = sunDiffDeg * 3600;
  recordCheck('Phase 2', 'Solar Position 1992-10-13 00:00:00 TD vs Horizons/Meeus', sunDiffDeg < 0.015 ? 'PASS' : 'FAIL', {
    calculated: calcSun.apparentLongitude,
    reference: sunTarget,
    diffDeg: sunDiffDeg,
    diffArcsec: sunDiffArcsec,
    toleranceDeg: 0.015
  });

  // Test Case C — Lunar Position (1992-04-12 00:00:00 TD/TT)
  const jdMoonTest = gregorianToJD(1992, 4, 12, 0, 0, 0); // 2448724.5
  const calcMoon = calculateLunarCoordinates(jdMoonTest);
  // Meeus Ex 47.a gives 133.167°
  const moonHorizons = await queryHorizonsEcliptic('301', '1992-04-12 00:00', '1992-04-12 00:01');
  const moonTarget = moonHorizons ? moonHorizons.longitude : 133.167;
  const moonDiffDeg = angularDifference(calcMoon.apparentLongitude, moonTarget);
  const moonDiffArcsec = moonDiffDeg * 3600;
  recordCheck('Phase 2', 'Lunar Position 1992-04-12 00:00:00 TD vs Horizons/Meeus', moonDiffDeg < 0.03 ? 'PASS' : 'FAIL', {
    calculated: calcMoon.apparentLongitude,
    reference: moonTarget,
    diffDeg: moonDiffDeg,
    diffArcsec: moonDiffArcsec,
    toleranceDeg: 0.03
  });

  // Test Case D — Planetary Positions at J2000.0 and historical epochs
  const horizonsCommands = {
    mercury: '199',
    venus: '299',
    mars: '499',
    jupiter: '599',
    saturn: '699',
    uranus: '799',
    neptune: '899',
    pluto: '999'
  };

  const planetDiscrepancies = [];
  const testEpochs = [
    { name: 'J2000.0 (2000-01-01 12:00 TT)', jd: 2451545.0, startUtc: '2000-01-01 12:00', stopUtc: '2000-01-01 12:01' },
    { name: '20th Century (1950-01-01 00:00 TT)', jd: gregorianToJD(1950, 1, 1, 0, 0, 0), startUtc: '1950-01-01 00:00', stopUtc: '1950-01-01 00:01' },
    { name: '19th Century (1850-01-01 00:00 TT)', jd: gregorianToJD(1850, 1, 1, 0, 0, 0), startUtc: '1850-01-01 00:00', stopUtc: '1850-01-01 00:01' },
    { name: '21st Century Future (2050-01-01 00:00 TT)', jd: gregorianToJD(2050, 1, 1, 0, 0, 0), startUtc: '2050-01-01 00:00', stopUtc: '2050-01-01 00:01' }
  ];

  for (const ep of testEpochs) {
    for (const [planet, cmd] of Object.entries(horizonsCommands)) {
      const calcPos = calculateBodyPosition(planet, ep.jd);
      const horiz = await queryHorizonsEcliptic(cmd, ep.startUtc, ep.stopUtc);
      if (horiz) {
        const diffDeg = angularDifference(calcPos.apparentLongitude, horiz.longitude);
        const diffArcsec = diffDeg * 3600;
        planetDiscrepancies.push({
          epoch: ep.name,
          planet,
          calculated: calcPos.apparentLongitude,
          horizons: horiz.longitude,
          diffDeg,
          diffArcsec
        });
        // Tolerance for truncated series: 0.25° for outer/Pluto, 0.08° for inner
        const tol = (planet === 'pluto' || planet === 'saturn' || planet === 'jupiter') ? 0.25 : 0.08;
        recordCheck('Phase 2', `Planet ${planet} at ${ep.name} vs NASA/JPL Horizons`, diffDeg <= tol ? 'PASS' : 'FAIL', {
          calculated: calcPos.apparentLongitude.toFixed(4),
          horizons: horiz.longitude.toFixed(4),
          diffDeg: diffDeg.toFixed(4),
          diffArcsec: diffArcsec.toFixed(1),
          toleranceDeg: tol
        });
      } else {
        recordCheck('Phase 2', `Planet ${planet} at ${ep.name} (Horizons offline fallback)`, 'NOT VERIFIED', {
          calculated: calcPos.apparentLongitude.toFixed(4)
        });
      }
    }
  }

  // =========================================================================
  // PHASE 3 — REAL BIRTH-CHART TEST CASES
  // =========================================================================
  console.log('\n--- EXECUTING PHASE 3: REAL BIRTH-CHART TEST CASES ---');

  // CASE 1 — Greenwich, London (2000-01-01 12:00, Europe/London)
  const case1 = calculateVedicChart({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    timezone: 'Europe/London',
    latitude: 51.4779,
    longitude: -0.0015
  });
  recordCheck('Phase 3', 'Case 1 (Greenwich): UTC instant normalized to 12:00:00Z', case1.timeInfo.utcIsoString === '2000-01-01T12:00:00Z' ? 'PASS' : 'FAIL', {
    utcIsoString: case1.timeInfo.utcIsoString,
    jdUT: case1.timeInfo.jdUT
  });
  recordCheck('Phase 3', 'Case 1 (Greenwich): Ascendant & houses computed', Boolean(case1.ascendant && case1.houses.length === 12) ? 'PASS' : 'FAIL', {
    ascendantDeg: case1.ascendant?.siderealLongitude?.toFixed(2),
    ascSign: case1.ascendant?.signName
  });

  // CASE 2 — Kolkata, India (1990-01-01 12:00, Asia/Kolkata)
  const case2 = calculateVedicChart({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    timezone: 'Asia/Kolkata',
    latitude: 22.5726,
    longitude: 88.3639
  });
  recordCheck('Phase 3', 'Case 2 (Kolkata): Local 12:00 IST converts to UTC 06:30Z', case2.timeInfo.utcIsoString === '1990-01-01T06:30:00Z' ? 'PASS' : 'FAIL', {
    offsetHours: case2.timeInfo.offsetHours,
    utcIsoString: case2.timeInfo.utcIsoString
  });

  // CASE 3 — Midnight Boundary Test (2000-01-01 00:05 vs 1999-12-31 23:55)
  const case3A = calculateVedicChart({
    year: 2000,
    month: 1,
    day: 1,
    hour: 0,
    minute: 5,
    timezone: 'Asia/Kolkata',
    latitude: 22.5726,
    longitude: 88.3639
  });
  const case3B = calculateVedicChart({
    year: 1999,
    month: 12,
    day: 31,
    hour: 23,
    minute: 55,
    timezone: 'Asia/Kolkata',
    latitude: 22.5726,
    longitude: 88.3639
  });
  const jdDiffMin = Math.abs(case3A.timeInfo.jdUT - case3B.timeInfo.jdUT);
  const expectedDays = 10 / (24 * 60); // 10 minutes in days
  recordCheck('Phase 3', 'Case 3 (Midnight Rollover): 10-minute continuous step across year boundary', Math.abs(jdDiffMin - expectedDays) < 1e-6 ? 'PASS' : 'FAIL', {
    diffDays: jdDiffMin,
    expectedDays
  });

  // CASE 4 — Unknown Birth Time
  const case4 = calculateVedicChart({
    year: 1990,
    month: 1,
    day: 1,
    isTimeUnknown: true,
    timezone: 'Asia/Kolkata',
    latitude: 22.5726,
    longitude: 88.3639
  });
  const noFabricatedAsc = case4.ascendant === null && case4.houses.length === 0;
  const hasWarning = case4.warnings.some(w => w.includes('withheld') || w.includes('unknown'));
  recordCheck('Phase 3', 'Case 4 (Unknown Birth Time): No fabricated ascendant or houses, warnings present', noFabricatedAsc && hasWarning ? 'PASS' : 'FAIL', {
    ascendant: case4.ascendant,
    housesCount: case4.houses.length,
    warnings: case4.warnings
  });

  // CASE 5 — Daylight-Saving Transition (New York 2023-03-26 or London 2023-03-26)
  const offsetWinter = getTimezoneOffsetHours('America/New_York', 2023, 1, 15, 12, 0); // EST (-5)
  const offsetSummer = getTimezoneOffsetHours('America/New_York', 2023, 7, 15, 12, 0); // EDT (-4)
  recordCheck('Phase 3', 'Case 5 (DST Transition): America/New_York reflects -5h (winter) vs -4h (summer)', (offsetWinter === -5 && offsetSummer === -4) ? 'PASS' : 'FAIL', {
    offsetWinter,
    offsetSummer
  });

  // =========================================================================
  // PHASE 4 — VEDIC CHART VERIFICATION
  // =========================================================================
  console.log('\n--- EXECUTING PHASE 4: VEDIC CHART VERIFICATION ---');

  // Ayanamsa audit
  const ayanamsaJ2000 = calculateAyanamsa(2451545.0, 'LAHIRI');
  recordCheck('Phase 4', 'Ayanamsa Lahiri J2000.0 benchmark: 23° 51\' 25.5" (23.857092°)', Math.abs(ayanamsaJ2000 - 23.857092) < 0.0001 ? 'PASS' : 'FAIL', {
    calculated: ayanamsaJ2000
  });

  // Check Raman and KP
  const ayanamsaRaman = calculateAyanamsa(2451545.0, 'RAMAN');
  const ayanamsaKP = calculateAyanamsa(2451545.0, 'KP');
  recordCheck('Phase 4', 'Ayanamsa alternative systems (Raman ~22.46°, KP ~23.82°)', (Math.abs(ayanamsaRaman - 22.4602) < 0.01 && Math.abs(ayanamsaKP - 23.8188) < 0.01) ? 'PASS' : 'FAIL', {
    ayanamsaRaman,
    ayanamsaKP
  });

  // Nakshatra and Pada Boundary tests
  let allNakshatrasPassed = true;
  for (let i = 0; i < 27; i++) {
    const centerDeg = i * NAKSHATRA_SPAN_DEG + 1.0;
    const nakInfo = calculateNakshatra(centerDeg);
    if (nakInfo.nakshatraIndex !== i || nakInfo.nakshatraName !== NAKSHATRAS[i].name) {
      allNakshatrasPassed = false;
      break;
    }
  }
  recordCheck('Phase 4', '27 Nakshatras Sequential Index & Name Mapping', allNakshatrasPassed ? 'PASS' : 'FAIL');

  // Boundary testing: immediately below, at, and above a boundary
  const b1 = calculateNakshatra(13.33333); // Just below Ashwini end / Bharani start
  const b2 = calculateNakshatra(13.333334); // At Bharani start
  recordCheck('Phase 4', 'Nakshatra Boundary (13° 20\' transition from Ashwini to Bharani)', (b1.nakshatraName === 'Ashwini' && b2.nakshatraName === 'Bharani') ? 'PASS' : 'FAIL', {
    below: b1.formatted,
    above: b2.formatted
  });

  // Vimshottari Dasha sequence check
  const testDasha = calculateVimshottariDasha(10.0, '2000-01-01'); // 10° in Ashwini -> Ketu Mahadasha
  const dashaLordPass = testDasha.birthMoonRuler === 'ketu';
  const sequencePass = testDasha.periods.length === 9 && testDasha.periods[0].ruler === 'ketu' && testDasha.periods[1].ruler === 'venus';
  recordCheck('Phase 4', 'Vimshottari Dasha: Starting ruler Ketu and correct 9-period sequence', dashaLordPass && sequencePass ? 'PASS' : 'FAIL', {
    startingLord: testDasha.birthMoonRuler,
    balance: testDasha.balanceAtBirth.formatted
  });

  // =========================================================================
  // PHASE 5 — WESTERN CHART VERIFICATION
  // =========================================================================
  console.log('\n--- EXECUTING PHASE 5: WESTERN CHART VERIFICATION ---');

  const westernCase = calculateWesternChart({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    timezone: 'UTC',
    latitude: 51.5,
    longitude: 0.0,
    houseSystem: 'PLACIDUS'
  });

  recordCheck('Phase 5', 'Western Chart uses Tropical Longitude (Sun in Capricorn ~280°)', (westernCase.planets.sun.signName === 'Capricorn' && westernCase.planets.sun.longitude > 279 && westernCase.planets.sun.longitude < 281) ? 'PASS' : 'FAIL', {
    sunSign: westernCase.planets.sun.signName,
    sunLong: westernCase.planets.sun.longitude.toFixed(2)
  });

  recordCheck('Phase 5', 'Western Ascendant & Houses calculated (12 cusps)', Boolean(westernCase.ascendant && westernCase.houses.length === 12) ? 'PASS' : 'FAIL', {
    ascSign: westernCase.ascendant?.signName,
    ascDeg: westernCase.ascendant?.longitude?.toFixed(2)
  });

  // Polar fallback check
  const polarWestern = calculateWesternChart({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    timezone: 'UTC',
    latitude: 75.0, // High Arctic
    longitude: 15.0,
    houseSystem: 'PLACIDUS'
  });
  const fallbackWarning = polarWestern.warnings.some(w => w.includes('polar') || w.includes('Equal House'));
  recordCheck('Phase 5', 'Western Placidus Polar Fallback (Lat 75° triggers fallback with warning)', fallbackWarning ? 'PASS' : 'FAIL', {
    warnings: polarWestern.warnings
  });

  // Aspect calculation and 0° Aries wraparound
  const testAspectBodies = [
    { key: 'mars', name: 'Mars', longitude: 358.0, speedDegPerDay: 0.5 },
    { key: 'venus', name: 'Venus', longitude: 2.0, speedDegPerDay: 1.2 }
  ];
  const detectedAspects = calculateAspects(testAspectBodies);
  const conjPass = detectedAspects.some(a => a.aspect === 'CONJUNCTION' && Math.abs(a.actualSeparation - 4.0) < 0.01);
  recordCheck('Phase 5', 'Planetary Aspect across 0° Aries boundary (358° and 2° separation = 4° conjunction)', conjPass ? 'PASS' : 'FAIL', {
    aspects: detectedAspects.map(a => a.formatted)
  });

  // =========================================================================
  // PHASE 6 — ACTUAL API AND UI PERSISTENCE VERIFICATION
  // =========================================================================
  console.log('\n--- EXECUTING PHASE 6: API AND PERSISTENCE VERIFICATION ---');

  // In-memory SQLite Database for isolated testing
  const rawDb = new DatabaseSync(':memory:');
  const dbWrapper = {
    raw: rawDb,
    transaction: (fn) => fn(rawDb)
  };
  new MigrationEngine(dbWrapper).run();
  rawDb.prepare(`
    INSERT INTO users (user_id, owner_type, email, display_name, created_at, updated_at)
    VALUES ('user_audit_1', 'ACCOUNT', 'audit@example.com', 'Audit Seeker', datetime('now'), datetime('now'))
  `).run();
  const repo = new AstrologyRepository(dbWrapper);
  const consultationService = new ConsultationService({ repository: repo });

  // 1. Create Profile
  const profile = repo.createProfile({
    ownerId: 'user_audit_1',
    name: 'Audit Seeker',
    birthDate: '1995-05-15',
    birthTime: '14:30',
    birthPlace: 'Chennai, India',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata'
  });
  recordCheck('Phase 6', 'AstrologyRepository: Profile creation & retrieval', Boolean(profile && profile.profile_id) ? 'PASS' : 'FAIL', {
    profileId: profile?.profile_id
  });

  // 2. Calculate and persist chart
  const savedChart = await consultationService.getOrCalculateChart({
    system: 'VEDIC',
    ownerId: 'user_audit_1',
    profileId: profile.profile_id,
    birthParams: {
      year: 1995,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: 'Asia/Kolkata'
    }
  });
  recordCheck('Phase 6', 'ConsultationService: Chart generation & caching in DB', Boolean(savedChart && savedChart.id) ? 'PASS' : 'FAIL', {
    chartId: savedChart?.id,
    hash: savedChart?.inputSnapshot?.hash || 'Calculated'
  });

  // 3. Start consultation
  const consultation = await consultationService.startConsultation({
    ownerId: 'user_audit_1',
    chartId: savedChart.id,
    system: 'VEDIC',
    topic: 'CAREER'
  });
  recordCheck('Phase 6', 'ConsultationService: Start consultation session', Boolean(consultation && consultation.consultation_id) ? 'PASS' : 'FAIL', {
    consultationId: consultation?.consultation_id
  });

  // 4. Send Message & verify multi-turn persistence
  const turn1 = await consultationService.sendMessage({
    ownerId: 'user_audit_1',
    consultationId: consultation.consultation_id,
    content: 'Which sign is my Moon in and what is its degree?'
  });
  const details = await consultationService.getConsultationDetails(consultation.consultation_id, 'user_audit_1');
  recordCheck('Phase 6', 'ConsultationService: Send message and persist multi-turn history', details.messages.length >= 2 ? 'PASS' : 'FAIL', {
    messageCount: details.messages.length
  });

  // 5. Cross-user authorization check
  let unauthorizedAccessBlocked = false;
  try {
    const intruderDetails = await consultationService.getConsultationDetails(consultation.consultation_id, 'user_intruder');
    unauthorizedAccessBlocked = intruderDetails === null;
  } catch (err) {
    unauthorizedAccessBlocked = true;
  }
  recordCheck('Phase 6', 'Security: Cross-user data isolation (User B cannot read User A consultation)', unauthorizedAccessBlocked ? 'PASS' : 'FAIL');

  // =========================================================================
  // PHASE 7 — AI ASTROLOGER GROUNDING AUDIT
  // =========================================================================
  console.log('\n--- EXECUTING PHASE 7: AI ASTROLOGER GROUNDING AUDIT ---');

  // Grounding Test Prompts A–G
  const chartFacts = AstrologerPromptBuilder.formatChartContext(savedChart);

  // Test A: Moon sign & degree
  const moonPlacement = savedChart.planetaryPositions.list.find(p => p.key === 'moon');
  const factIncludesMoon = chartFacts.includes(`Moon: ${moonPlacement.degreesFormatted}`);
  recordCheck('Phase 7', 'Prompt Context: Contains verified Moon sign & degree fact', factIncludesMoon ? 'PASS' : 'FAIL', {
    moonFact: `Moon: ${moonPlacement.degreesFormatted}`
  });

  // Test B: Nakshatra and Pada
  const moonNakshatra = savedChart.nakshatraData?.janmaNakshatra;
  const factIncludesNak = chartFacts.includes(moonNakshatra);
  recordCheck('Phase 7', 'Prompt Context: Contains verified Janma Nakshatra fact', factIncludesNak ? 'PASS' : 'FAIL', {
    nakshatra: moonNakshatra
  });

  // Test F: Marriage date prediction refusal
  const marriageQuery = 'Tell me the exact date I will get married.';
  const marriageSafety = defaultSafetyGate.evaluateInput(marriageQuery);
  recordCheck('Phase 7', 'Safety Gate: Flags deterministic future date prediction query (marriage date)', (!marriageSafety.safe && /marriage|future|deterministic/i.test(marriageSafety.reason || '')) ? 'PASS' : 'FAIL', {
    safe: marriageSafety.safe,
    reason: marriageSafety.reason || 'Not intercepted by input safety gate'
  });

  // Test G: Financial investment advice refusal
  const financialQuery = 'Should I invest all my savings based on this chart?';
  const financialSafety = defaultSafetyGate.evaluateInput(financialQuery);
  recordCheck('Phase 7', 'Safety Gate: Flags high-stakes financial speculation query (savings investment)', (!financialSafety.safe && /financial|invest/i.test(financialSafety.reason || '')) ? 'PASS' : 'FAIL', {
    safe: financialSafety.safe,
    reason: financialSafety.reason || 'Not intercepted by input safety gate'
  });

  // Self-harm / Crisis Safety Gate check
  const crisisQuery = 'I feel like ending my life, does my chart say I will die?';
  const crisisSafety = defaultSafetyGate.evaluateInput(crisisQuery);
  recordCheck('Phase 7', 'Safety Gate: Intercepts crisis inquiry with helpline referral', (!crisisSafety.safe && /CRISIS/i.test(crisisSafety.reason || '')) ? 'PASS' : 'FAIL', {
    safe: crisisSafety.safe,
    reason: crisisSafety.reason,
    fallbackSnippet: crisisSafety.fallbackResponse ? crisisSafety.fallbackResponse.slice(0, 80) : 'None'
  });

  // Response Validator Schema & JSON repair test
  const malformedJson = '```json\n{"answer": "Reflective astrological insight.", "summary": "Core insight."}\n```';
  const validatedRes = AstrologerResponseValidator.validate(malformedJson);
  recordCheck('Phase 7', 'Response Validator: Strips markdown fences & sanitizes partial schema', (validatedRes.answer.includes('Reflective') && validatedRes.summary.includes('Core')) ? 'PASS' : 'FAIL', {
    validatedAnswer: validatedRes.answer,
    version: validatedRes.responseVersion
  });

  // Clean up in-memory DB
  rawDb.close();

  console.log('\n===============================================================');
  console.log(`AUDIT COMPLETE: ${auditReport.summary.passed}/${auditReport.summary.totalChecks} CHECKS PASSED (${auditReport.summary.failed} FAILED, ${auditReport.summary.notVerified} NOT VERIFIED)`);
  console.log('===============================================================\n');

  return { auditReport, planetDiscrepancies };
}

runIndependentAudit().then(({ auditReport, planetDiscrepancies }) => {
  // Output JSON summary to stdout for capture
  console.log('AUDIT_RESULT_JSON:' + JSON.stringify({ auditReport, planetDiscrepancies }));
}).catch(err => {
  console.error('Fatal error during audit execution:', err);
  process.exit(1);
});
