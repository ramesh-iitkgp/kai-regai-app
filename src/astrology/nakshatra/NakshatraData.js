/**
 * NakshatraData — 27 Classical Vedic Nakshatras & Attributes
 * 
 * Sources:
 * - Taittiriya Samhita, Atharva Veda
 * - Brihat Samhita (Varahamihira)
 */

export const NAKSHATRAS = [
  { index: 0, name: 'Ashwini', ruler: 'ketu', deity: 'Ashwini Kumaras', symbol: "Horse's Head", yoni: 'Horse' },
  { index: 1, name: 'Bharani', ruler: 'venus', deity: 'Yama', symbol: 'Yoni / Vagina', yoni: 'Elephant' },
  { index: 2, name: 'Krittika', ruler: 'sun', deity: 'Agni', symbol: 'Razor / Flame', yoni: 'Sheep' },
  { index: 3, name: 'Rohini', ruler: 'moon', deity: 'Brahma / Prajapati', symbol: 'Ox Cart / Chariot', yoni: 'Serpent' },
  { index: 4, name: 'Mrigashira', ruler: 'mars', deity: 'Soma', symbol: "Deer's Head", yoni: 'Serpent' },
  { index: 5, name: 'Ardra', ruler: 'rahu', deity: 'Rudra', symbol: 'Teardrop / Diamond', yoni: 'Dog' },
  { index: 6, name: 'Punarvasu', ruler: 'jupiter', deity: 'Aditi', symbol: 'Bow and Quiver', yoni: 'Cat' },
  { index: 7, name: 'Pushya', ruler: 'saturn', deity: 'Brihaspati', symbol: "Cow's Udder / Lotus", yoni: 'Goat' },
  { index: 8, name: 'Ashlesha', ruler: 'mercury', deity: 'Nagas / Serpents', symbol: 'Coiled Serpent', yoni: 'Cat' },
  { index: 9, name: 'Magha', ruler: 'ketu', deity: 'Pitris (Ancestors)', symbol: 'Royal Throne', yoni: 'Rat' },
  { index: 10, name: 'Purva Phalguni', ruler: 'venus', deity: 'Bhaga', symbol: 'Front Legs of Bed', yoni: 'Rat' },
  { index: 11, name: 'Uttara Phalguni', ruler: 'sun', deity: 'Aryaman', symbol: 'Back Legs of Bed', yoni: 'Cow' },
  { index: 12, name: 'Hasta', ruler: 'moon', deity: 'Savitr (Sun)', symbol: 'Open Hand / Palm', yoni: 'Buffalo' },
  { index: 13, name: 'Chitra', ruler: 'mars', deity: 'Vishwakarma', symbol: 'Bright Jewel / Pearl', yoni: 'Tiger' },
  { index: 14, name: 'Swati', ruler: 'rahu', deity: 'Vayu', symbol: 'Young Shoot / Coral', yoni: 'Buffalo' },
  { index: 15, name: 'Vishakha', ruler: 'jupiter', deity: 'Indra & Agni', symbol: 'Triumphal Arch', yoni: 'Tiger' },
  { index: 16, name: 'Anuradha', ruler: 'saturn', deity: 'Mitra', symbol: 'Lotus / Staff', yoni: 'Hare' },
  { index: 17, name: 'Jyeshtha', ruler: 'mercury', deity: 'Indra', symbol: 'Circular Amulet / Earring', yoni: 'Hare' },
  { index: 18, name: 'Mula', ruler: 'ketu', deity: 'Nirriti', symbol: 'Tied Bunch of Roots', yoni: 'Dog' },
  { index: 19, name: 'Purva Ashadha', ruler: 'venus', deity: 'Apas (Water)', symbol: "Elephant's Tusk / Fan", yoni: 'Monkey' },
  { index: 20, name: 'Uttara Ashadha', ruler: 'sun', deity: 'Vishwadevas', symbol: 'Elephant Tusk / Bed', yoni: 'Mongoose' },
  { index: 21, name: 'Shravana', ruler: 'moon', deity: 'Vishnu', symbol: 'Three Footprints / Ear', yoni: 'Monkey' },
  { index: 22, name: 'Dhanishta', ruler: 'mars', deity: 'Ashta Vasus', symbol: 'Musical Drum (Mridangam)', yoni: 'Lion' },
  { index: 23, name: 'Shatabhisha', ruler: 'rahu', deity: 'Varuna', symbol: 'Empty Circle / 100 Physicians', yoni: 'Horse' },
  { index: 24, name: 'Purva Bhadrapada', ruler: 'jupiter', deity: 'Aja Ekapada', symbol: 'Front Legs of Funeral Cot', yoni: 'Lion' },
  { index: 25, name: 'Uttara Bhadrapada', ruler: 'saturn', deity: 'Ahirbudhnya', symbol: 'Back Legs of Funeral Cot', yoni: 'Cow' },
  { index: 26, name: 'Revati', ruler: 'mercury', deity: 'Pushan', symbol: 'Pair of Fish / Drum', yoni: 'Elephant' }
];

export const NAKSHATRA_SPAN_DEG = 360.0 / 27.0; // 13.333333333333334° = 13° 20'
export const PADA_SPAN_DEG = NAKSHATRA_SPAN_DEG / 4.0; // 3.3333333333333335° = 3° 20'
