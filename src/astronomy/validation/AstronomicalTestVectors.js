/**
 * AstronomicalTestVectors — Independently Verified Reference Datasets
 * 
 * Sources:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Ed), numerical examples:
 *   - Example 7.a: Sputnik 1 launch (1957 Oct 4.81 = 19h 26m 24s UT) -> JD 2436116.31
 *   - Example 12.a: 1987 April 10, 0h UT -> GMST 197.693195° (13h 10m 46.3668s)
 *   - Example 22.a: 1987 April 10, 0h TD -> Mean obliquity 23.440946°, Δψ = -3.788", Δε = 9.443"
 *   - Example 25.a: 1992 October 13, 0h TD -> Sun apparent longitude 199.906° (199° 54' 21.6"), R = 0.99766 AU
 *   - Example 47.a: 1992 April 12, 0h TD -> Moon apparent longitude 133.167° (133° 10' 00"), latitude -3.229°
 * - Benchmark Epoch J2000.0 (2000 Jan 1, 12h TT = JD 2451545.0):
 *   Geocentric apparent ecliptic longitudes (JPL DE405 / VSOP87 / Chapront ELP-2000/82):
 *   - Sun: 280.37° (Capricorn 10° 22')
 *   - Moon: 223.31° (Scorpio 13° 19')
 *   - Mercury: 271.90° (Capricorn 1° 54')
 *   - Venus: 241.57° (Sagittarius 1° 34')
 *   - Mars: 327.96° (Aquarius 27° 57')
 *   - Jupiter: 25.34° (Aries 25° 20')
 *   - Saturn: 40.19° (Taurus 10° 11', Retrograde)
 *   - Uranus: 315.61° (Aquarius 15° 37')
 *   - Neptune: 302.59° (Aquarius 2° 35')
 *   - Pluto: 251.13° (Sagittarius 11° 08')
 *   - Rahu: 125.04° (Cancer 5° 02', Retrograde)
 *   - Ketu: 305.04° (Capricorn 5° 02', Retrograde)
 */

export const REFERENCE_TEST_VECTORS = {
  julianDate: [
    {
      name: 'Standard Epoch J2000.0 (2000 Jan 1.5 TT)',
      input: { year: 2000, month: 1, day: 1, hour: 12, minute: 0, second: 0 },
      expectedJD: 2451545.0,
      toleranceDays: 1e-6
    },
    {
      name: 'Meeus Example 7.a (1957 Oct 4.81 = 19h 26m 24s UT)',
      input: { year: 1957, month: 10, day: 4, hour: 19, minute: 26, second: 24 },
      expectedJD: 2436116.31,
      toleranceDays: 0.0001
    },
    {
      name: 'Meeus Example 7.c (Historical Date 1600 Dec 31)',
      input: { year: 1600, month: 12, day: 31, hour: 0, minute: 0, second: 0 },
      expectedJD: 2305812.5,
      toleranceDays: 1e-6
    },
    {
      name: 'Leap Year Century 2000 Feb 29',
      input: { year: 2000, month: 2, day: 29, hour: 12, minute: 0, second: 0 },
      expectedJD: 2451604.0,
      toleranceDays: 1e-6
    }
  ],

  siderealTime: [
    {
      name: 'Meeus Example 12.a (1987 April 10, 0h UT)',
      inputJD: 2446895.5,
      expectedGMSTDeg: 197.693195, // 13h 10m 46.3668s
      toleranceDeg: 0.0005
    }
  ],

  obliquityAndNutation: [
    {
      name: 'Meeus Example 22.a (1987 April 10, 0h TD)',
      inputJD: 2446895.5,
      expectedMeanObliquityDeg: 23.440946, // 23° 26' 27.407"
      expectedDeltaPsiArcsec: -3.788,
      expectedDeltaEpsArcsec: 9.443,
      toleranceDeg: 0.0005,
      toleranceArcsec: 0.15
    }
  ],

  sun: [
    {
      name: 'Meeus Example 25.a (1992 October 13, 0h TD)',
      inputJD: 2448908.5,
      expectedApparentLongDeg: 199.906, // 199° 54' 21.6"
      expectedDistanceAU: 0.99766,
      toleranceDeg: 0.015,
      toleranceAU: 0.0005
    }
  ],

  moon: [
    {
      name: 'Meeus Example 47.a (1992 April 12, 0h TD)',
      inputJD: 2448724.5,
      expectedApparentLongDeg: 133.167, // 133° 10' 00"
      expectedLatitudeDeg: -3.229,
      toleranceDeg: 0.03
    }
  ],

  planetsJPL: [
    {
      name: 'J2000.0 Reference Benchmark (2000 Jan 1.5 TT)',
      inputJD: 2451545.0,
      targets: {
        sun: { longitude: 280.37, tolerance: 0.03 },
        mercury: { longitude: 271.90, tolerance: 0.05 },
        venus: { longitude: 241.57, tolerance: 0.05 },
        mars: { longitude: 327.96, tolerance: 0.05 },
        jupiter: { longitude: 25.34, tolerance: 0.05 },
        saturn: { longitude: 40.19, tolerance: 0.05 }
      }
    }
  ]
};
