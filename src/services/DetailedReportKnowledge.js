/**
 * DetailedReportKnowledge Service — Comprehensive Chiromancy Interpretations
 * Dynamically synthesizes user palm input into structured data for the report views:
 * 1. Overview (Quick Summary items + 6 Line cards)
 * 2. Detailed Line View (Key indications, 4 Reveal cards tailored to user's selected input)
 * 3. Life Journey Insights (5 Timeline developmental phases & Path Ahead)
 * Source of truth: Hasta Samudrika Shastra & user reference designs
 */

export const LINE_CONFIGS = {
  HEART: {
    key: 'HEART',
    name: 'Heart Line',
    sectionId: 'heart_line',
    sanskrit: 'हृदय रेखा (Hridaya Rekha)',
    subtitle: 'Emotions • Relationships • Love • Inner Fulfilment',
    color: '#F43F5E',
    colorDark: 'rgba(244, 63, 94, 0.18)',
    badgeBg: '#FEE2E2',
    icon: 'heart',
    element: 'Water / Anahata',
    calloutText: 'Love, emotions and relationships'
  },
  HEAD: {
    key: 'HEAD',
    name: 'Head Line',
    sectionId: 'head_line',
    sanskrit: 'शिरो रेखा / मातृ रेखा (Shiro Rekha)',
    subtitle: 'Intellect • Wisdom • Focus • Decision Making',
    color: '#00D2FF',
    colorDark: 'rgba(0, 210, 255, 0.18)',
    badgeBg: '#E0F2FE',
    icon: 'brain',
    element: 'Air / Ajna',
    calloutText: 'Mind, intelligence and decision making'
  },
  LIFE: {
    key: 'LIFE',
    name: 'Life Line',
    sectionId: 'life_line',
    sanskrit: 'आयु रेखा / जीवन रेखा (Ayu Rekha)',
    subtitle: 'Vitality • Constitution • Longevity • Life Journey',
    color: '#FBBF24',
    colorDark: 'rgba(251, 191, 36, 0.18)',
    badgeBg: '#FEF3C7',
    icon: 'sprout',
    element: 'Earth / Muladhara',
    calloutText: 'Vitality, health and life journey'
  },
  FATE: {
    key: 'FATE',
    name: 'Fate Line',
    sectionId: 'destiny_line',
    sanskrit: 'भाग्य रेखा (Bhagya Rekha)',
    subtitle: 'Vocation • Destiny • Milestones • Ambition',
    color: '#10B981',
    colorDark: 'rgba(16, 185, 129, 0.18)',
    badgeBg: '#DCFCE7',
    icon: 'mountain',
    element: 'Saturn / Karma',
    calloutText: 'Career, success and achievements'
  },
  SUN: {
    key: 'SUN',
    name: 'Sun Line',
    sectionId: 'sun_line',
    sanskrit: 'सूर्य रेखा / विद्या रेखा (Surya Rekha)',
    subtitle: 'Radiance • Recognition • Prosperity • Creative Distinction',
    color: '#A855F7',
    colorDark: 'rgba(168, 85, 247, 0.18)',
    badgeBg: '#F3E8FF',
    icon: 'sun',
    element: 'Sun / Tejas',
    calloutText: 'Recognition, talent and prosperity'
  },
  OTHER: {
    key: 'OTHER',
    name: 'Other Lines',
    sectionId: 'marriage_line',
    sanskrit: 'विवाह व विशेष रेखा (Vivaha & Samudrika)',
    subtitle: 'Marriage • Health • Intuition • Sacred Markings',
    color: '#6366F1',
    colorDark: 'rgba(99, 102, 241, 0.18)',
    badgeBg: '#EEF2FF',
    icon: 'compass',
    element: 'Mercury & Samudrika',
    calloutText: 'Mercury, marriage and more'
  }
};

/**
 * Generate 5 Quick Summary items from user profile
 */
export function getReportQuickSummary(profile = {}) {
  const heartVar = profile.heart_line || 'CURVED';
  const headVar = profile.head_line || 'SLOPING';
  const lifeVar = profile.life_line || 'LONG_CLEAR';
  const fateVar = profile.destiny_line || 'CLEAR';
  const sunVar = profile.sun_line || 'CLEAR';

  // 1. Emotional Nature
  let emotionalText = 'Warm, loyal and deeply caring in relationships.';
  if (heartVar === 'STRAIGHT') emotionalText = 'Logical, steady and composed in relationship commitments.';
  else if (heartVar === 'SHORT') emotionalText = 'Emotionally self-reliant with healthy individual boundaries.';
  else if (heartVar === 'DEEP') emotionalText = 'Deeply passionate with unwavering loyalty to loved ones.';
  else if (heartVar === 'FORKED') emotionalText = 'Thoughtful harmony of romantic warmth and rational wisdom.';

  // 2. Mind & Thinking
  let mindText = 'Practical, analytical and determined.';
  if (headVar === 'SLOPING') mindText = 'Creative, imaginative with rich intuitive problem-solving.';
  else if (headVar === 'LONG') mindText = 'Deep, contemplative thinker with comprehensive focus.';
  else if (headVar === 'FORKED') mindText = 'Versatile thinker bridging analytical logic and visionary insight.';
  else if (headVar === 'SHORT') mindText = 'Direct, practical and rapid decisive action-taker.';

  // 3. Vitality & Life Path
  let vitalityText = 'Strong life force with good stamina and resilience.';
  if (lifeVar === 'WIDE_CURVE') vitalityText = 'Expansive vital spirit with boundless social warmth and zest.';
  else if (lifeVar === 'CLOSE_TO_THUMB') vitalityText = 'Calm energy conservation, safeguarding inner peace and home.';
  else if (lifeVar === 'SHORT') vitalityText = 'Focused vital flow, thrives with mindful rhythmic replenishment.';

  // 4. Career & Success
  let careerText = 'Steady progress with significant growth opportunities.';
  if (fateVar === 'CROSSES_PALM') careerText = 'Clear vocational dharma with purposeful trajectory from early age.';
  else if (fateVar === 'DOUBLE_LINE') careerText = 'Dual vocational talents excelling across simultaneous callings.';
  else if (fateVar === 'INTERRUPTED') careerText = 'Dynamic career rebirths unlocking elevated leadership chapters.';
  else if (fateVar === 'ABSENT') careerText = 'Self-forged path unrestrained by conventional career molds.';

  // 5. Inner Strength
  let innerText = 'Balanced, intuitive and spiritually inclined.';
  if (sunVar === 'LONG' || sunVar === 'CLEAR') innerText = 'Creative magnetic radiance and recognized personal distinction.';
  if (profile.special_markings === 'CROSS' || profile.special_markings === 'STAR') {
    innerText = 'Heightened intuitive sixth sense and protective spiritual grace.';
  }

  return [
    {
      id: 'emotional',
      lineKey: 'HEART',
      title: 'Emotional Nature',
      desc: emotionalText,
      icon: 'heart',
      color: '#F43F5E',
      bg: '#FEE2E2'
    },
    {
      id: 'mind',
      lineKey: 'HEAD',
      title: 'Mind & Thinking',
      desc: mindText,
      icon: 'brain',
      color: '#00D2FF',
      bg: '#E0F2FE'
    },
    {
      id: 'vitality',
      lineKey: 'LIFE',
      title: 'Vitality & Life Path',
      desc: vitalityText,
      icon: 'runner',
      color: '#FBBF24',
      bg: '#FEF3C7'
    },
    {
      id: 'career',
      lineKey: 'FATE',
      title: 'Career & Success',
      desc: careerText,
      icon: 'mountain',
      color: '#10B981',
      bg: '#DCFCE7'
    },
    {
      id: 'inner',
      lineKey: 'SUN',
      title: 'Inner Strength',
      desc: innerText,
      icon: 'lotus',
      color: '#A855F7',
      bg: '#F3E8FF'
    }
  ];
}

/**
 * Detailed Line Interpretations tailored directly to the user's selected input
 */
export function getDetailedLineData(lineKey = 'HEART', profile = {}) {
  const hand = (profile.hand || 'LEFT').toUpperCase();
  const isLeft = hand === 'LEFT';
  const handLabel = isLeft ? 'Left Palm' : 'Right Palm';

  if (lineKey === 'HEART') {
    const heartVar = profile.heart_line || 'CURVED';
    let optName = 'Curved Upwards';
    let paragraph = `Your heart line is <strong>long and clear, gently curved upwards</strong> towards the index finger. This indicates a <strong>warm, loyal and idealistic nature</strong>. You value deep emotional connections, are caring and give importance to trust and commitment in relationships.`;

    if (heartVar === 'STRAIGHT') {
      optName = 'Straight';
      paragraph = `Your heart line is <strong>straight and linear across the upper palm</strong>. This indicates a <strong>composed, logical and grounded approach to emotional bonds</strong>. You value fairness, clear boundaries and emotional stability.`;
    } else if (heartVar === 'SHORT') {
      optName = 'Short';
      paragraph = `Your heart line is <strong>compact, ending beneath the Saturn mount</strong>. This indicates an <strong>independent, self-reliant emotional nature</strong> with discerning personal boundaries.`;
    } else if (heartVar === 'DEEP') {
      optName = 'Deep Line';
      paragraph = `Your heart line is <strong>richly and deeply etched</strong>. This denotes <strong>profound devotion, unwavering loyalty and intensely felt soul commitments</strong>.`;
    } else if (heartVar === 'FORKED') {
      optName = 'Forked';
      paragraph = `Your heart line terminates with a <strong>graceful fork between Jupiter and Saturn</strong>. This reflects <strong>balanced emotional warmth tempered with wise discernment</strong>.`;
    } else if (heartVar === 'LONG' || heartVar === 'LONG_CLEAR') {
      optName = 'Long & Clear';
      paragraph = `Your heart line is <strong>long, unbroken and radiant</strong>. This denotes an <strong>expansive capacity for generosity, emotional integrity and enduring love</strong>.`;
    }

    return {
      config: LINE_CONFIGS.HEART,
      sectionId: 'heart_line',
      selectedOptionId: heartVar,
      selectedOptionName: optName,
      handLabel,
      headline: 'Your Heart Line',
      paragraph,
      indications: [
        { icon: 'heart', color: '#F43F5E', bg: '#FEE2E2', text: 'Deep capacity for love and emotional bonding.' },
        { icon: 'user', color: '#6366F1', bg: '#EEF2FF', text: 'Loyal and supportive partner.' },
        { icon: 'lotus', color: '#D97706', bg: '#FEF3C7', text: 'Sensitive and empathetic towards others.' },
        { icon: 'handshake', color: '#10B981', bg: '#DCFCE7', text: 'Seeks stable, long-term relationships.' }
      ],
      reveals: [
        { icon: 'heart', title: 'Emotional Nature', desc: 'Caring, affectionate and sensitive.' },
        { icon: 'users', title: 'Relationships', desc: 'Values trust, loyalty and commitment.' },
        { icon: 'mind', title: 'Love Style', desc: 'Expresses love deeply and sincerely.' },
        { icon: 'lotus', title: 'Inner Fulfilment', desc: 'Finds happiness in meaningful connections.' }
      ]
    };
  }

  if (lineKey === 'HEAD') {
    const headVar = profile.head_line || 'SLOPING';
    let optName = 'Gently Sloping';
    let paragraph = `Your head line is <strong>gracefully sloping towards the Moon Mount</strong>. This indicates an <strong>intuitive, creative mind grounded in sound judgment</strong>. You balance intellectual analysis with imaginative empathy.`;

    if (headVar === 'STRAIGHT') {
      optName = 'Straight';
      paragraph = `Your head line is <strong>straight and resolute, traversing horizontally across the mid-palm</strong>. This indicates a <strong>practical, analytical mind grounded in disciplined logic</strong>. You evaluate situations with cool composure and prefer facts over speculation.`;
    } else if (headVar === 'LONG') {
      optName = 'Long & Deep';
      paragraph = `Your head line is <strong>deep and expansive</strong>. This marks <strong>sustained powers of concentration, contemplative focus and deep intellect</strong>.`;
    } else if (headVar === 'SHORT') {
      optName = 'Short & Direct';
      paragraph = `Your head line is <strong>concise and focused</strong>. This denotes a <strong>direct, rapid decision-maker who values immediate practical execution</strong>.`;
    } else if (headVar === 'FORKED') {
      optName = 'Writer’s Fork';
      paragraph = `Your head line features a <strong>classic Writer’s Fork branching at the end</strong>. This reveals a <strong>versatile intellect bridging analytical logic with visionary imagination</strong>.`;
    }

    return {
      config: LINE_CONFIGS.HEAD,
      sectionId: 'head_line',
      selectedOptionId: headVar,
      selectedOptionName: optName,
      handLabel,
      headline: 'Your Head Line',
      paragraph,
      indications: [
        { icon: 'brain', color: '#00D2FF', bg: '#E0F2FE', text: 'Rich analytical capacity with deep intuition.' },
        { icon: 'sparkle', color: '#FBBF24', bg: '#FEF3C7', text: 'Imaginative insight and creative problem-solving.' },
        { icon: 'target', color: '#10B981', bg: '#DCFCE7', text: 'Steady concentration and mental endurance.' },
        { icon: 'compass', color: '#6366F1', bg: '#EEF2FF', text: 'Pragmatic approach to lifelong learning.' }
      ],
      reveals: [
        { icon: 'brain', title: 'Intellectual Focus', desc: 'Synthesizes facts with instinct effortlessly.' },
        { icon: 'compass', title: 'Decision Making', desc: 'Weighs long-term implications with clarity.' },
        { icon: 'target', title: 'Problem Solving', desc: 'Finds innovative solutions to complex hurdles.' },
        { icon: 'sparkle', title: 'Creative Vision', desc: 'Envisions possibilities beyond conventional limits.' }
      ]
    };
  }

  if (lineKey === 'LIFE') {
    const lifeVar = profile.life_line || 'LONG_CLEAR';
    let optName = 'Long & Clear';
    let paragraph = `Your life line traces a <strong>generous, unbroken contour embracing the Venus Mount</strong>. This signifies a <strong>resilient vital constitution and enduring inner zest</strong>. It reflects the vibrant channel of prana animating your journey.`;

    if (lifeVar === 'WIDE_CURVE') {
      optName = 'Wide Arc';
      paragraph = `Your life line sweeps in an <strong>expansive arc across the palm base</strong>. This denotes <strong>generous social warmth, love of exploration and boundless physical enthusiasm</strong>.`;
    } else if (lifeVar === 'CLOSE_TO_THUMB') {
      optName = 'Close to Thumb';
      paragraph = `Your life line hugs <strong>compactly around the thumb base</strong>. This indicates <strong>mindful energy conservation, calm self-protection and peace in home sanctuary</strong>.`;
    } else if (lifeVar === 'SHORT') {
      optName = 'Short';
      paragraph = `Your life line is <strong>compact and focused</strong>. It reflects <strong>vitality that thrives with conscious daily rhythm and mindful replenishment</strong>.`;
    } else if (lifeVar === 'DEEP') {
      optName = 'Deep & Rich';
      paragraph = `Your life line is <strong>deeply etched like a riverbed</strong>. This denotes <strong>formidable physical stamina, high recovery power and grounded tenacity</strong>.`;
    }

    return {
      config: LINE_CONFIGS.LIFE,
      sectionId: 'life_line',
      selectedOptionId: lifeVar,
      selectedOptionName: optName,
      handLabel,
      headline: 'Your Life Line',
      paragraph,
      indications: [
        { icon: 'sprout', color: '#FBBF24', bg: '#FEF3C7', text: 'Strong recuperative constitution and vigor.' },
        { icon: 'heart', color: '#F43F5E', bg: '#FEE2E2', text: 'Deep roots in family and domestic sanctuary.' },
        { icon: 'shield', color: '#10B981', bg: '#DCFCE7', text: 'Robust natural immunity and stress resilience.' },
        { icon: 'lotus', color: '#A855F7', bg: '#F3E8FF', text: 'Harmonious pacing that sustains energy.' }
      ],
      reveals: [
        { icon: 'sprout', title: 'Vitality Level', desc: 'Sustained energy with natural resilience.' },
        { icon: 'shield', title: 'Health Flow', desc: 'Steady recovery through mindful balance.' },
        { icon: 'compass', title: 'Adaptability', desc: 'Navigates life changes with grounded grace.' },
        { icon: 'lotus', title: 'Life Fulfillment', desc: 'Derives joy from healthy, active living.' }
      ]
    };
  }

  if (lineKey === 'FATE') {
    const fateVar = profile.destiny_line || 'CLEAR';
    let optName = 'Clear & Steady';
    let paragraph = `Your destiny line ascends <strong>purposefully toward the Saturn Mount beneath the middle finger</strong>. This reflects <strong>earned vocational authority, purposeful discipline, and recognized achievements</strong> built upon self-directed will (Purushartha).`;

    if (fateVar === 'CROSSES_PALM') {
      optName = 'Crosses Palm';
      paragraph = `Your fate line ascends <strong>unbroken from the wrist to Saturn</strong>. This denotes <strong>early vocational clarity, steadfast persistence and unbroken momentum</strong>.`;
    } else if (fateVar === 'DOUBLE_LINE') {
      optName = 'Double Career';
      paragraph = `Your palm carries <strong>two parallel fate lines</strong>. This indicates <strong>dual vocations, simultaneous passions or multiple successful careers</strong>.`;
    } else if (fateVar === 'INTERRUPTED') {
      optName = 'Transformative Pivots';
      paragraph = `Your fate line shows <strong>deliberate shift segments</strong>. This marks <strong>transformative career pivots that elevate your impact and fulfillment</strong>.`;
    } else if (fateVar === 'ABSENT' || fateVar === 'FAINT') {
      optName = 'Self-Made Path';
      paragraph = `Your fate line is <strong>fluid and subtle</strong>. You are a <strong>self-directed trailblazer forging an authentic, self-defined destiny</strong>.`;
    }

    return {
      config: LINE_CONFIGS.FATE,
      sectionId: 'destiny_line',
      selectedOptionId: fateVar,
      selectedOptionName: optName,
      handLabel,
      headline: 'Your Fate & Destiny Line',
      paragraph,
      indications: [
        { icon: 'mountain', color: '#10B981', bg: '#DCFCE7', text: 'Clear sense of vocational dharma and calling.' },
        { icon: 'trophy', color: '#FBBF24', bg: '#FEF3C7', text: 'Recognized leadership in professional sphere.' },
        { icon: 'target', color: '#00D2FF', bg: '#E0F2FE', text: 'Persistence through transformative milestones.' },
        { icon: 'crown', color: '#A855F7', bg: '#F3E8FF', text: 'Substantial progress rewarded with authority.' }
      ],
      reveals: [
        { icon: 'mountain', title: 'Vocational Drive', desc: 'Clear trajectory guided by discipline.' },
        { icon: 'target', title: 'Financial Flow', desc: 'Steady accumulation through structured effort.' },
        { icon: 'trophy', title: 'Turning Points', desc: 'Milestones that elevate career standing.' },
        { icon: 'crown', title: 'Leadership', desc: 'Inspires peers with ethical competence.' }
      ]
    };
  }

  if (lineKey === 'SUN') {
    const sunVar = profile.sun_line || 'CLEAR';
    let optName = 'Clear & Radiant';
    let paragraph = `The Sun Line radiates beneath your ring finger on the Apollo Mount. This indicates <strong>creative distinction, social warmth, and earned public recognition</strong>. It illuminates your endeavors with charisma and artistic refinement.`;

    if (sunVar === 'LONG') {
      optName = 'Long Luminous Ray';
      paragraph = `Your Sun Line extends <strong>deep into the middle palm</strong>. This signifies <strong>sustained creative distinction, radiant personal charm and broad social respect</strong>.`;
    } else if (sunVar === 'SHORT') {
      optName = 'High Ray in Maturity';
      paragraph = `Your Sun Line glows <strong>high beneath the ring finger</strong>. This promises <strong>ripe recognition, celebrated achievements and fulfilling distinctions in mature years</strong>.`;
    } else if (sunVar === 'MULTIPLE') {
      optName = 'Multiple Creative Rays';
      paragraph = `You possess <strong>multiple fine Sun lines</strong>. This reflects <strong>versatile artistic talents and multifaceted accomplishments across varied fields</strong>.`;
    } else if (sunVar === 'ABSENT' || sunVar === 'FAINT') {
      optName = 'Subtle Ray';
      paragraph = `Your Sun line is <strong>delicate and private</strong>. You find <strong>deep inner delight and quiet fulfillment without relying on external praise</strong>.`;
    }

    return {
      config: LINE_CONFIGS.SUN,
      sectionId: 'sun_line',
      selectedOptionId: sunVar,
      selectedOptionName: optName,
      handLabel,
      headline: 'Your Sun & Apollo Line',
      paragraph,
      indications: [
        { icon: 'sun', color: '#A855F7', bg: '#F3E8FF', text: 'Natural charisma and magnetic personal presence.' },
        { icon: 'sparkle', color: '#FBBF24', bg: '#FEF3C7', text: 'Refined aesthetic taste and cultural flair.' },
        { icon: 'trophy', color: '#10B981', bg: '#DCFCE7', text: 'Celebrated distinctions in mature years.' },
        { icon: 'heart', color: '#F43F5E', bg: '#FEE2E2', text: 'Generous warmth that draws uplifting allies.' }
      ],
      reveals: [
        { icon: 'sun', title: 'Creative Radiance', desc: 'Illuminates projects with original artistry.' },
        { icon: 'trophy', title: 'Public Recognition', desc: 'Gains respect in community and industry.' },
        { icon: 'sparkle', title: 'Inner Joy', desc: 'Finds deep delight in expressing authentic self.' },
        { icon: 'heart', title: 'Social Influence', desc: 'Uplifts collaborators with optimistic spirit.' }
      ]
    };
  }

  // OTHER LINES: Marriage Line, Mercury Line & Special Markings
  const marriageVar = profile.marriage_line || 'SINGLE_CLEAR';
  const markVar = profile.special_markings || 'NONE';
  const cleanMName = marriageVar.replace(/_/g, ' ');

  return {
    config: LINE_CONFIGS.OTHER,
    sectionId: 'marriage_line',
    selectedOptionId: marriageVar,
    selectedOptionName: cleanMName,
    handLabel,
    headline: 'Marriage, Mercury & Sacred Markings',
    paragraph: `Your hand reveals distinct secondary features on the percussion below the pinky finger. Your <strong>Marriage Line (${cleanMName})</strong> indicates <strong>deep emotional commitments and relationship karma</strong>, while sacred mount markings (${markVar}) provide protection and higher intuition.`,
    indications: [
      { icon: 'heart', color: '#F43F5E', bg: '#FEE2E2', text: `Marriage Line: ${cleanMName} on side of hand.` },
      { icon: 'sparkle', color: '#A855F7', bg: '#F3E8FF', text: `Sacred Symbol: ${markVar} mark present.` },
      { icon: 'brain', color: '#00D2FF', bg: '#E0F2FE', text: 'Mercury Line: Fluent communication & business intuition.' },
      { icon: 'shield', color: '#10B981', bg: '#DCFCE7', text: 'Mount Formations: Balanced pranic energy flow.' }
    ],
    reveals: [
      { icon: 'heart', title: 'Union Karma', desc: 'Profound soul attachment with dedicated partner.' },
      { icon: 'sparkle', title: 'Sacred Markings', desc: `${markVar} symbol bestows unique karmic gifts.` },
      { icon: 'brain', title: 'Mercury Eloquence', desc: 'Articulate speech, commercial instinct & wit.' },
      { icon: 'shield', title: 'Palm Archetype', desc: `${profile.shape || 'SQUARE'} hand provides grounded foundation.` }
    ]
  };
}

/**
 * 5 Timeline Developmental Phases for View 3 (Life Journey Insights)
 */
export function getLifeJourneyTimeline(profile = {}) {
  return {
    quote: 'Life is a journey of growth, balance and purpose. Your palm reveals the natural flow of opportunities and important turning points along the way.',
    phases: [
      {
        id: 'phase1',
        title: 'Early Life',
        years: '0 – 18 years',
        color: '#D97706',
        colorDark: '#78350F',
        bg: '#FEF3C7',
        icon: 'leaf',
        summary: 'A period of learning, family support and building strong foundations. You are naturally curious and quick to adapt.',
        calloutLabel: 'Key Strength',
        calloutText: 'Curiosity and quick learning.',
        calloutIcon: 'bulb'
      },
      {
        id: 'phase2',
        title: 'Growth & Learning',
        years: '19 – 32 years',
        color: '#0284C7',
        colorDark: '#0C4A6E',
        bg: '#E0F2FE',
        icon: 'cap',
        summary: 'A time of skill development, exploration and important opportunities. You are likely to face challenges that bring significant growth and maturity.',
        calloutLabel: 'Opportunities',
        calloutText: 'Career growth, higher education and skill enhancement.',
        calloutIcon: 'chart'
      },
      {
        id: 'phase3',
        title: 'Career & Progress',
        years: '33 – 45 years',
        color: '#059669',
        colorDark: '#064E3B',
        bg: '#DCFCE7',
        icon: 'stairs',
        summary: 'This is a strong phase for career stability, recognition and financial growth. Your determination and hard work bring success.',
        calloutLabel: 'Key Focus',
        calloutText: 'Leadership, financial stability and long-term goals.',
        calloutIcon: 'trophy'
      },
      {
        id: 'phase4',
        title: 'Stability & Relationships',
        years: '46 – 60 years',
        color: '#E11D48',
        colorDark: '#881337',
        bg: '#FFE4E6',
        icon: 'group',
        summary: 'A balanced phase with focus on family, relationships and personal fulfilment. You bring wisdom and guidance to others.',
        calloutLabel: 'Key Theme',
        calloutText: 'Family harmony, strong relationships and giving back.',
        calloutIcon: 'heart'
      },
      {
        id: 'phase5',
        title: 'Wisdom & Legacy',
        years: '60+ years',
        color: '#7C3AED',
        colorDark: '#4C1D95',
        bg: '#F3E8FF',
        icon: 'meditate',
        summary: 'A peaceful and meaningful phase. You are likely to focus on spirituality, mentoring and leaving a positive legacy.',
        calloutLabel: 'Life Purpose',
        calloutText: 'Inner peace, spiritual growth and guiding others.',
        calloutIcon: 'lotus'
      }
    ],
    pathAhead: {
      title: 'Your Path Ahead',
      text: 'Your palm shows a balanced life journey with steady growth, meaningful relationships and a strong sense of purpose. By staying focused and maintaining balance, you can achieve fulfilment and leave a lasting positive impact.'
    }
  };
}
