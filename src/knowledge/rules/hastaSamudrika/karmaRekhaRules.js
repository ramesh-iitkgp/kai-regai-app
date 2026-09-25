/**
 * Hasta Samudrika Rules — Karma Rekha, Surya Rekha & Sacred Markings
 * Authority: Bhavishya Purana, Garuda Purana, Dr. Narayan Dutt Shrimali (1980)
 * Epistemic Tier: 3 (Hasta Samudrika)
 */

export const samudrikaKarmaRekhaRules = [
  {
    ruleId: 'HS_KARMA_UNBROKEN_SHANI_01',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'FATE_LINE',
    name: 'Urdhva / Bhagya Rekha Shani Gamini',
    sanskritName: 'ऊर्ध्व रेखा (भाग्य / कर्म रेखा)',
    author: 'Bhavishya Purana',
    citation: 'Brahma Parva, Samudrika Khanda',
    conditions: {
      all_of: [
        { feature: 'lines.fate_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.fate_line.continuity', operator: 'IN', value: ['STRONG_CENTRAL', 'UNBROKEN', 'CONTINUOUS'] }
      ]
    },
    interpretation: {
      title: 'Svadharma & Vocational Fortitude',
      archetype: 'The Purposeful Pilgrim',
      summary: 'In Hasta Samudrika, an unbroken vertical spire ascending to Saturn signifies adherence to svadharma (one\'s intrinsic purpose).',
      detail: 'Shrimali notes that an unhindered Karma Rekha gives the resilience to master a domain over time through steady perseverance and unyielding self-effort (purushartha).',
      synthesis: 'Your vocational momentum thrives when grounded in long-term mastery, deliberate focus, and intrinsic devotion.'
    },
    confidence: 0.92
  }
];

export const samudrikaSuryaRekhaRules = [
  {
    ruleId: 'HS_SURYA_RADIANT_APOLLO_01',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'SUN_LINE',
    name: 'Ravi / Surya Rekha',
    sanskritName: 'सूर्य रेखा (विद्या / यश रेखा)',
    author: 'Garuda Purana',
    citation: 'Purva Khanda, Samudrika Vidya',
    conditions: {
      all_of: [
        { feature: 'lines.sun_line.detected', operator: 'EQUALS', value: true },
        { feature: 'lines.sun_line.strength', operator: 'IN', value: ['PROMINENT_UPPER', 'DEEP', 'CLEAR'] }
      ]
    },
    interpretation: {
      title: 'Tejas & Radiant Distinction',
      archetype: 'The Luminous Creator',
      summary: 'Traditional Sanskrit texts term this the Vidya Rekha (crease of learning) or Yash Rekha (crease of renown).',
      detail: 'Classical commentaries view it as the signature of Tejas (inner radiance), ethical charisma, and public distinction.',
      synthesis: 'Your natural aesthetic discernment and genuine warmth leave an enduring impression.'
    },
    confidence: 0.90
  }
];

export const samudrikaMarkingRules = [
  {
    ruleId: 'HS_MARK_TRISHULA_TRIDENT_01',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'SPECIAL_MARKINGS',
    name: 'Trishula (Trident) Auspicious Mark',
    sanskritName: 'त्रिशूल चिह्न',
    author: 'Dr. N.D. Shrimali',
    citation: 'Practical Palmistry, Chapter 9: Auspicious Signs',
    conditions: {
      any_of: [
        { feature: 'special_markings.types', operator: 'IN', value: ['TRISHULA_TRIDENT', 'TRIDENT'] },
        { feature: 'lines.heart_line.forking', operator: 'IN', value: ['TRIDENT_TERMINATION', 'TRISHULA_FORK'] }
      ]
    },
    interpretation: {
      title: 'Auspicious Trishula Synthesis',
      archetype: 'The Consecrated Architect',
      summary: 'The Trishula is celebrated across classical Indian palmistry as an emblem of spiritual wisdom, righteous willpower, and administrative benevolence.',
      detail: 'A trident terminus blending will, intellect, and devotional affect protects the individual against moral compromise and elevates collaborative enterprises.',
      synthesis: 'Your highest achievements integrate sharp intellect, compassionate ethics, and clear will.'
    },
    confidence: 0.95
  },
  {
    ruleId: 'HS_MARK_YAVA_BARLEY_02',
    sourceSystem: 'HASTA_SAMUDRIKA',
    epistemicTier: 3,
    domain: 'SPECIAL_MARKINGS',
    name: 'Yava (Barley Grain) on Thumb Joint',
    sanskritName: 'यव चिह्न (अङ्गुष्ठ मध्य)',
    author: 'Bhavishya Purana',
    citation: 'Brahma Parva, Samudrika Khanda',
    conditions: {
      all_of: [
        { feature: 'special_markings.types', operator: 'IN', value: ['FISH_YAV', 'YAVA_GRAIN'] }
      ]
    },
    interpretation: {
      title: 'Yava Sign of Intellectual Flourishing',
      archetype: 'The Scholar-Provider',
      summary: 'An enclosed eye-shaped contour on the thumb phalangeal crease is revered in Hasta Samudrika as the mark of intuitive wisdom and prosperity.',
      detail: 'Sanskrit verses correlate the clear Yava with good repute, scholarly acumen, and the capacity to nurture family and community.',
      synthesis: 'Your mental faculties possess an organic integrity that provides stability and counsel to those around you.'
    },
    confidence: 0.93
  }
];
