/**
 * TimezoneConverter — Birth Time to Canonical UTC and Julian Date Conversion
 * 
 * Uses standard Intl.DateTimeFormat for zero-dependency historical timezone lookups.
 * Preserves raw input, normalized UTC components, and computes both JD(UT) and JD(TT).
 */

import { gregorianToJD } from './JulianDate.js';
import { utToTT } from './DeltaT.js';

/**
 * Parses timezone input which can be:
 * - An IANA timezone identifier (e.g. 'Asia/Kolkata', 'America/New_York')
 * - An ISO offset (e.g. '+05:30', '-08:00', 'Z')
 * - A numeric hour offset (e.g. 5.5, -5)
 * 
 * @param {string|number} tzInput 
 * @param {number} year 
 * @param {number} month 
 * @param {number} day 
 * @param {number} hour 
 * @param {number} minute 
 * @returns {number} Offset in hours from UTC (e.g. +5.5 for IST)
 */
export function getTimezoneOffsetHours(tzInput, year, month, day, hour = 12, minute = 0) {
  if (typeof tzInput === 'number') {
    return tzInput;
  }

  const str = String(tzInput).trim();

  // Match ISO offset pattern: +/-HH:MM or +/-HHMM or +/-HH or Z
  if (str === 'Z' || str === 'UTC' || str === 'GMT') {
    return 0;
  }

  const offsetMatch = str.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (offsetMatch) {
    const sign = offsetMatch[1] === '-' ? -1 : 1;
    const h = parseInt(offsetMatch[2], 10);
    const m = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0;
    return sign * (h + m / 60.0);
  }

  // Attempt IANA timezone resolution via Intl.DateTimeFormat
  try {
    // Form an approximate UTC date to inspect timezone
    const approxDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: str,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(approxDate);
    const partMap = {};
    for (const p of parts) {
      partMap[p.type] = p.value;
    }

    const tzYear = parseInt(partMap.year, 10);
    const tzMonth = parseInt(partMap.month, 10);
    const tzDay = parseInt(partMap.day, 10);
    const tzHour = parseInt(partMap.hour === '24' ? '0' : partMap.hour, 10);
    const tzMin = parseInt(partMap.minute, 10);

    const targetLocalMs = Date.UTC(year, month - 1, day, hour, minute);
    const resolvedLocalMs = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin);
    const diffMs = resolvedLocalMs - approxDate.getTime();
    return diffMs / (1000 * 3600.0);
  } catch (err) {
    // Fallback default: if timezone name is unrecognized, default to 0 with warning
    console.warn(`TimezoneConverter: Unrecognized timezone "${str}", defaulting to UTC 0`, err.message);
    return 0;
  }
}

/**
 * Normalizes birth inputs into canonical astronomical time representations.
 * 
 * @param {object} params
 * @param {string|number} params.year Year (e.g. 1998)
 * @param {string|number} params.month Month 1-12
 * @param {string|number} params.day Day 1-31
 * @param {string|number} [params.hour=12] Hour 0-23
 * @param {string|number} [params.minute=0] Minute 0-59
 * @param {string|number} [params.second=0] Second 0-59
 * @param {string|number} [params.timezone='UTC'] IANA tz or offset string
 * @param {boolean} [params.isTimeUnknown=false]
 * @returns {object} Canonical time object
 */
export function normalizeBirthTime({
  year,
  month,
  day,
  hour = 12,
  minute = 0,
  second = 0,
  timezone = 'UTC',
  isTimeUnknown = false
}) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  let h = isTimeUnknown ? 12 : parseFloat(hour);
  let min = isTimeUnknown ? 0 : parseFloat(minute);
  let s = isTimeUnknown ? 0 : parseFloat(second);

  // Validate bounds
  if (isNaN(y) || isNaN(m) || isNaN(d)) {
    throw new Error(`Invalid birth date parameters: year=${year}, month=${month}, day=${day}`);
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    throw new Error(`Birth date out of bounds: ${y}-${m}-${d}`);
  }

  const offsetHours = getTimezoneOffsetHours(timezone, y, m, d, Math.floor(h), Math.floor(min));

  // Compute UTC decimal hour
  let totalLocalHours = h + min / 60.0 + s / 3600.0;
  let totalUtcHours = totalLocalHours - offsetHours;

  // Handle day wrap if UTC is before or after local day
  let utYear = y;
  let utMonth = m;
  let utDay = d;

  while (totalUtcHours < 0.0) {
    totalUtcHours += 24.0;
    utDay -= 1;
    if (utDay < 1) {
      utMonth -= 1;
      if (utMonth < 1) {
        utYear -= 1;
        utMonth = 12;
      }
      utDay = new Date(Date.UTC(utYear, utMonth, 0)).getUTCDate();
    }
  }

  while (totalUtcHours >= 24.0) {
    totalUtcHours -= 24.0;
    utDay += 1;
    const maxDays = new Date(Date.UTC(utYear, utMonth, 0)).getUTCDate();
    if (utDay > maxDays) {
      utDay = 1;
      utMonth += 1;
      if (utMonth > 12) {
        utYear += 1;
        utMonth = 1;
      }
    }
  }

  const utHour = Math.floor(totalUtcHours);
  const remMin = (totalUtcHours - utHour) * 60.0;
  const utMinute = Math.floor(remMin);
  const utSecond = Math.round((remMin - utMinute) * 60.0 * 1000) / 1000;

  // Calculate Julian Date in Universal Time (UT)
  const jdUT = gregorianToJD(utYear, utMonth, utDay, utHour, utMinute, utSecond);

  // Calculate Julian Date in Terrestrial Time (TT)
  const decimalYear = y + (m - 1) / 12.0 + (d - 1) / 365.25;
  const jdTT = utToTT(jdUT, decimalYear);

  return {
    rawInput: {
      year: y,
      month: m,
      day: d,
      hour: isTimeUnknown ? null : h,
      minute: isTimeUnknown ? null : min,
      second: isTimeUnknown ? null : s,
      timezone: String(timezone),
      isTimeUnknown
    },
    offsetHours,
    isTimeUnknown,
    utcComponents: {
      year: utYear,
      month: utMonth,
      day: utDay,
      hour: utHour,
      minute: utMinute,
      second: utSecond
    },
    utcIsoString: `${utYear}-${String(utMonth).padStart(2, '0')}-${String(utDay).padStart(2, '0')}T${String(utHour).padStart(2, '0')}:${String(utMinute).padStart(2, '0')}:${String(Math.floor(utSecond)).padStart(2, '0')}Z`,
    jdUT,
    jdTT,
    deltaTSeconds: (jdTT - jdUT) * 86400.0
  };
}
