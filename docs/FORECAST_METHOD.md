# How the daily forecast is computed

Everything on the forecast screens comes from astronomy, not from random numbers.

## Rashi
The Rashi is the **Moon sign** (Janma Rashi) at birth, sidereal, Lahiri ayanamsa, from `calculateVedicChart`. The Sun sign (date-range lookup) is not used.

## Love / Energy / Luck scores
`src/astrology/gochara/GocharaRules.js`. Each planet's transit house is counted from the natal Moon (Gochara). Houses in `FAVOURABLE_HOUSES_FROM_MOON` count as favourable. Each gauge is a weighted sum of planets (`SCORE_MODEL`), scaled between a floor of 40 and a ceiling of 95. Each score reports its `drivers`, the planets that moved it. Planet positions are taken at local sunrise.

STATUS: the favourable-house table and weights must be checked against the project's P1 source registry before release. Do not present it as classical authority until then.

## Times
`src/astronomy/time/SunTimes.js`: NOAA/Meeus sunrise and sunset (accurate to about 1 minute, checked against `astral`).
- Rahu Kalam: one eighth of daytime, by weekday (Sun 8, Mon 2, Tue 7, Wed 5, Thu 6, Fri 4, Sat 3).
- Abhijit: the 8th of 15 daytime muhurtas.
- Brahma Muhurta: 96 to 48 minutes before sunrise.
Location is the stored birth/current place, else the default (Chennai), and the UI says "(default location)".

## Colour
Fixed by weekday (vara), not random.

## Known limits
- Jupiter/Saturn positions are 0.3-0.5 degrees off (Keplerian elements, not VSOP87). Fine for sign and house, not for ingress days.
- Moon nakshatra/pada is accurate to the ephemeris Moon.
- If the ephemeris throws, metrics fall back to 50.
- Non-English labels need native-speaker review.
