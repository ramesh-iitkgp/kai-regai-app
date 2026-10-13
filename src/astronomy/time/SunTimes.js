/**
 * SunTimes — sunrise, sunset and the Panchang day-parts derived from them.
 *
 * Sunrise/sunset use the NOAA solar-position equations (Meeus, "Astronomical
 * Algorithms"), accurate to about a minute at inhabited latitudes. Sunrise is
 * the moment the Sun's upper limb meets the horizon, with standard refraction
 * (zenith 90.833 deg). Altitude and local terrain are ignored.
 *
 * Day-parts (all measured from sunrise, as Panchang does):
 *  - Rahu Kalam: the daytime (sunrise to sunset) is split into 8 equal parts;
 *    Rahu rules a different part each weekday (Sun 8th, Mon 2nd, Tue 7th,
 *    Wed 5th, Thu 6th, Fri 4th, Sat 3rd).
 *  - Abhijit Muhurta: the 8th of the 15 equal daytime muhurtas (centred on
 *    local solar noon).
 *  - Brahma Muhurta: 96 to 48 minutes before sunrise.
 */

import { gregorianToJD } from './JulianDate.js';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const SUNRISE_ZENITH_DEG = 90.833;

/** Weekday (0 = Sunday) -> which eighth of the daytime is Rahu Kalam (1-based). */
export const RAHU_KALAM_PART_BY_WEEKDAY = Object.freeze([8, 2, 7, 5, 6, 4, 3]);

/**
 * Civil date, weekday and clock time of an instant in an IANA timezone.
 * @param {Date} instant
 * @param {string} tz IANA timezone, e.g. 'Asia/Kolkata'
 */
export function localDateParts(instant, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  }).formatToParts(instant);
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  const year = get('year');
  const month = get('month');
  const day = get('day');
  return {
    year, month, day,
    hour: get('hour'), minute: get('minute'),
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  };
}

/** "HH:MM" (24h) of an instant in a timezone. */
export function formatClock(instant, tz) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(instant);
}

/**
 * Sunrise, sunset and solar noon for a civil date at a place.
 *
 * @param {number} year
 * @param {number} month 1-12
 * @param {number} day
 * @param {number} lat degrees north
 * @param {number} lon degrees east
 * @returns {{ sunrise: Date|null, sunset: Date|null, solarNoon: Date }} sunrise/sunset are null in polar day/night
 */
export function solarEvents(year, month, day, lat, lon) {
  // Julian date of (approximately) local solar noon on this civil date
  const jd = gregorianToJD(year, month, day, 12, 0, 0) - lon / 360;
  const T = (jd - 2451545.0) / 36525.0;

  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const Mr = M * RAD;
  const C = Math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T))
    + Math.sin(2 * Mr) * (0.019993 - 0.000101 * T)
    + Math.sin(3 * Mr) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const lambda = (L0 + C) - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD));

  const y = Math.tan((eps * RAD) / 2) ** 2;
  const L0r = L0 * RAD;
  const eqTimeMin = 4 * DEG * (
    y * Math.sin(2 * L0r)
    - 2 * e * Math.sin(Mr)
    + 4 * e * y * Math.sin(Mr) * Math.cos(2 * L0r)
    - 0.5 * y * y * Math.sin(4 * L0r)
    - 1.25 * e * e * Math.sin(2 * Mr)
  );

  const dayStartUtcMs = Date.UTC(year, month - 1, day);
  const noonMin = 720 - 4 * lon - eqTimeMin;
  const at = (minutes) => new Date(dayStartUtcMs + minutes * 60000);

  const cosHa = Math.cos(SUNRISE_ZENITH_DEG * RAD) / (Math.cos(lat * RAD) * Math.cos(decl))
    - Math.tan(lat * RAD) * Math.tan(decl);
  if (cosHa < -1 || cosHa > 1) {
    return { sunrise: null, sunset: null, solarNoon: at(noonMin) };
  }
  const haDeg = Math.acos(cosHa) * DEG;
  return {
    sunrise: at(noonMin - 4 * haDeg),
    sunset: at(noonMin + 4 * haDeg),
    solarNoon: at(noonMin)
  };
}

/**
 * Panchang day-parts for a civil date at a place.
 *
 * @param {object} p
 * @param {number} p.year
 * @param {number} p.month
 * @param {number} p.day
 * @param {number} p.weekday 0 = Sunday
 * @param {number} p.lat
 * @param {number} p.lon
 * @returns {{ sunrise: Date, sunset: Date, rahuKalam: {start: Date, end: Date}, abhijit: {start: Date, end: Date}, brahma: {start: Date, end: Date}, approximate: boolean }}
 *   `approximate` is true when the sun does not rise/set that day (polar) and a 06:00-18:00 local-solar day is used instead.
 */
export function dayParts({ year, month, day, weekday, lat, lon }) {
  const ev = solarEvents(year, month, day, lat, lon);
  let sunrise = ev.sunrise;
  let sunset = ev.sunset;
  let approximate = false;
  if (!sunrise || !sunset) {
    approximate = true;
    sunrise = new Date(ev.solarNoon.getTime() - 6 * 3600000);
    sunset = new Date(ev.solarNoon.getTime() + 6 * 3600000);
  }

  const dayMs = sunset.getTime() - sunrise.getTime();
  const slice = (from, to, total) => ({
    start: new Date(sunrise.getTime() + (dayMs * from) / total),
    end: new Date(sunrise.getTime() + (dayMs * to) / total)
  });

  const part = RAHU_KALAM_PART_BY_WEEKDAY[weekday];
  return {
    sunrise,
    sunset,
    rahuKalam: slice(part - 1, part, 8),
    abhijit: slice(7, 8, 15),
    brahma: {
      start: new Date(sunrise.getTime() - 96 * 60000),
      end: new Date(sunrise.getTime() - 48 * 60000)
    },
    approximate
  };
}
