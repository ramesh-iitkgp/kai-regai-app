/**
 * AstronomyTypes — Constants, Metadata & Types for Custom Astronomy Engine
 */

export const ASTRONOMY_CALCULATION_VERSION = '1.0.0-vsop87-meeus';

export const EPHEMERIS_MODELS = {
  SUN: 'MEEUS_CH25_HIGH_PRECISION',
  MOON: 'CHAPRONT_ELP2000_82_TRUNCATED',
  PLANETS: 'VSOP87_KEPLERIAN_PERTURBATION',
  PLUTO: 'MEEUS_CH37_GOFFIN'
};

export const SUPPORTED_DATE_RANGE = {
  minYear: 1800,
  maxYear: 2100,
  description: 'High accuracy within ±0.03° between years 1800 and 2100 Gregorian.'
};

export const HOUSE_SYSTEMS = {
  WHOLE_SIGN: 'WHOLE_SIGN',
  EQUAL_HOUSE: 'EQUAL_HOUSE',
  PLACIDUS: 'PLACIDUS'
};

export const AYANAMSA_SYSTEMS = {
  LAHIRI: 'LAHIRI_CHITRAPAKSHA',
  RAMAN: 'RAMAN',
  KP: 'KRISHNAMURTI_PADHDHATI',
  NONE_TROPICAL: 'NONE_TROPICAL'
};
