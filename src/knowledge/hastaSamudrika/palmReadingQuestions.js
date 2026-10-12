/**
 * Hasta Samudrika Shastra — Palm Reading Knowledge Definitions & Synthesis
 * Grounded in classical treatises:
 * - Bhavishya Purana (Samudrika Khanda)
 * - Brihat Samhita (Varahamihira)
 * - Garuda Purana (Samudrika Adhyaya)
 * - Samudrika Tilaka (Durlabharaja)
 */

export const PALM_READING_QUESTIONS = [
  {
    id: 'flexibility',
    title: 'Hand Flexibility',
    sanskritTitle: 'कर नम्यता (Kara Namyata)',
    subtitle: 'Physical resilience, mental elasticity and adaptability to life changes',
    artMode: 'SIDE_HAND',
    featureKey: 'FLEXIBILITY',
    options: [
      {
        id: 'NOT_FLEXIBLE',
        label: 'Not Flexible',
        sanskritLabel: 'दृढ कर (Drida Kara)',
        desc: 'Firm and unyielding when gently pushed back',
        variant: 'NOT_FLEXIBLE',
        interpretation: {
          title: 'Drida Chitta — Steadfast Determination',
          summary: 'Classical texts revere a firm hand structure as an emblem of unwavering willpower, loyalty, and deep mental resolve.',
          detail: 'Brihat Samhita notes that individuals with firm hand flexibility approach challenges with measured deliberation and cautious realism. They rarely abandon a chosen path and value time-tested principles.',
          element: 'Prithvi (Earth)',
          activeVsPassive: 'On the Right Hand (Dakshina Kara), this indicates disciplined execution and steadfast work habits. On the Left Hand (Vama Kara), it reveals deep-rooted foundational values and innate resilience.'
        }
      },
      {
        id: 'MEDIUM',
        label: 'Balanced Flexibility',
        sanskritLabel: 'सम कर (Sama Kara)',
        desc: 'Natural slight gentle curve (~15°-20°)',
        variant: 'MEDIUM',
        interpretation: {
          title: 'Samatva — Equilibrium & Practical Discernment',
          summary: 'A balanced flexibility reflects a harmonious temperament capable of adapting without sacrificing core integrity.',
          detail: 'Garuda Purana praises this median flexibility as the mark of a judicious leader who easily harmonizes tradition with innovative practical adjustments.',
          element: 'Sama Bhuta (Harmonized Elements)',
          activeVsPassive: 'On the Right Hand, this signifies pragmatic social tact. On the Left Hand, it indicates an innate emotional buoyancy that resists cynicism.'
        }
      },
      {
        id: 'VERY_FLEXIBLE',
        label: 'Very Flexible',
        sanskritLabel: 'कोमल कर (Komal Kara)',
        desc: 'Supple and bends backwards easily (~40°+)',
        variant: 'VERY_FLEXIBLE',
        interpretation: {
          title: 'Komal Buddhi — Fluid Adaptability & Open Mind',
          summary: 'A supple, flexible hand reveals heightened emotional responsiveness, rapid versatile intelligence, and artistic sensitivity.',
          detail: 'Samudrika Tilaka records that flexible hands possess intuitive empathy and an instinctive ability to connect with people from all walks of life.',
          element: 'Vayu & Jala (Air & Water)',
          activeVsPassive: 'On the Right Hand, it shows quick-witted networking and conversational grace. On the Left Hand, it reveals profound empathic instincts and creative imagination.'
        }
      }
    ]
  },
  {
    id: 'head_line',
    title: 'Head Line (Shiro Rekha)',
    sanskritTitle: 'शिरो रेखा / मातृ रेखा (Shiro Rekha)',
    subtitle: 'Wisdom, intellectual clarity, focus and cognitive disposition (Replaces Western "Air line")',
    artMode: 'OPEN_PALM',
    featureKey: 'HEAD',
    options: [
      {
        id: 'NOT_CURVED',
        label: 'Straight & Direct',
        sanskritLabel: 'ऋजु शिरो रेखा (Riju Shiro)',
        desc: 'Linear trajectory across the palm toward Upper Mars',
        variant: 'NOT_CURVED',
        interpretation: {
          title: 'Tarka & Pragmatic Intellect',
          summary: 'A straight Shiro Rekha indicates sharp, fact-based logical discernment and decisive administrative capability.',
          detail: 'Shrimali notes that an unbroken straight line produces individuals who demand empirical verification and excel at cutting through ambiguity with common sense.',
          element: 'Agni & Prithvi (Fire & Earth)',
          activeVsPassive: 'On the Right Hand, it indicates disciplined pragmatic execution. On the Left Hand, it denotes an instinctive gift for structural clarity and objective reasoning.'
        }
      },
      {
        id: 'CURVED',
        label: 'Gently Curved',
        sanskritLabel: 'मध्यम वक्र (Madhyama Vakra)',
        desc: 'Soft descent balancing logic and imaginative instinct',
        variant: 'CURVED',
        interpretation: {
          title: 'Medha Shakti — Balanced Wisdom',
          summary: 'A gentle curve denotes a balanced intellect where logical calculation is enriched by intuitive foresight and creative vision.',
          detail: 'Bhavishya Purana describes this trajectory as the hallmark of counselors, strategists, and creators who bridge conceptual ideas with practical execution.',
          element: 'Vayu (Air)',
          activeVsPassive: 'On the Right Hand, it demonstrates versatile problem-solving in worldly pursuits. On the Left Hand, it reflects natural psychological intuition.'
        }
      },
      {
        id: 'VERY_CURVED',
        label: 'Deeply Descending',
        sanskritLabel: 'चन्द्रगामी रेखा (Chandra-Gamini)',
        desc: 'Sweeps downward toward the sacred Mount of Luna',
        variant: 'VERY_CURVED',
        interpretation: {
          title: 'Kavya Buddhi — Intuitive & Artistic Depth',
          summary: 'A deep curve sweeping into Chandra Kshetra (Moon Mount) signifies vivid imagination, philosophical introspection, and artistic flair.',
          detail: 'Classical Sanskrit treatises link this descent with literary eloquence, spiritual contemplation, and an ability to sense emotional atmospheres before words are spoken.',
          element: 'Jala & Chandra (Water & Lunar Prana)',
          activeVsPassive: 'On the Right Hand, it channels artistic vision into manifest works. On the Left Hand, it marks profound dream wisdom and latent psychic perception.'
        }
      }
    ]
  },
  {
    id: 'heart_line',
    title: 'Heart Line (Hridaya Rekha)',
    sanskritTitle: 'हृदय रेखा / पितृ रेखा (Hridaya Rekha)',
    subtitle: 'Devotional nature, emotional relationships and relational dharma (Replaces Western "Water line")',
    artMode: 'OPEN_PALM',
    featureKey: 'HEART',
    options: [
      {
        id: 'CONNECTED',
        label: 'Joined at Origin',
        sanskritLabel: 'युक्त हृदय रेखा (Yukta Rekha)',
        desc: 'Heart and Head lines converge closely at the thumb junction',
        variant: 'CONNECTED',
        interpretation: {
          title: 'Viveka Yukta Prema — Mindful Devotion',
          summary: 'When emotional and cognitive channels touch at their source, feelings are filtered through thoughtful reflection and self-restraint.',
          detail: 'Garuda Purana observes that this formation fosters protective, deeply loyal, and cautious affections, avoiding impulsive entanglements.',
          element: 'Prithvi (Earth)',
          activeVsPassive: 'On the Right Hand, it shows protective, responsible love. On the Left Hand, it signifies innate caution regarding vulnerability.'
        }
      },
      {
        id: 'NOT_CONNECTED',
        label: 'Separate Origin',
        sanskritLabel: 'वियुक्त हृदय रेखा (Viyukta Rekha)',
        desc: 'Clear, distinct gap allowing independent emotional flow',
        variant: 'NOT_CONNECTED',
        interpretation: {
          title: 'Svatantra Hridaya — Independent Spirit',
          summary: 'A distinct separation indicates emotional candor, spontaneous enthusiasm, and an uninhibited warmth toward life.',
          detail: 'Hasta Samudrika authorities praise this formation for generous hospitality, courage in self-expression, and an adventurous emotional heart.',
          element: 'Agni (Fire)',
          activeVsPassive: 'On the Right Hand, it manifests as charismatic leadership and openness. On the Left Hand, it reflects an untamed inner romantic fire.'
        }
      },
      {
        id: 'GURU_GAMI',
        label: 'High Arc to Jupiter',
        sanskritLabel: 'गुरुगामी रेखा (Guru-Gamini)',
        desc: 'Sweeps upward toward the noble Mount of Jupiter under the index finger',
        variant: 'GURU_GAMI',
        interpretation: {
          title: 'Udaara Bhakti — Noble Compassion & Integrity',
          summary: 'Termination on Guru Kshetra represents elevated ideals in love, generous emotional nobility, and uncompromising moral integrity.',
          detail: 'Bhavishya Purana records that persons with this arc elevate their partners, forgive generously, and foster lasting harmonious bonds.',
          element: 'Brihaspati (Jupiterian Akasha)',
          activeVsPassive: 'On the Right Hand, it establishes deep respect and ethical standing in partnerships. On the Left Hand, it denotes an innate aspiration for sacred union.'
        }
      }
    ]
  },
  {
    id: 'marriage_line',
    title: 'Marriage & Union Lines (Vivaha Rekha)',
    sanskritTitle: 'विवाह रेखा / सम्बन्ध रेखा (Vivaha Rekha)',
    subtitle: 'Deep soul connections, relational devotion and karmic partnerships',
    artMode: 'SIDE_HAND',
    featureKey: 'MARRIAGE',
    options: [
      {
        id: 'ONE_LINE',
        label: 'Single Deep Line',
        sanskritLabel: 'एक विवाह रेखा (Eka Rekha)',
        desc: 'One prominent, unbroken line on the outer edge below the pinky',
        variant: 'ONE_LINE',
        interpretation: {
          title: 'Eka Nishtha — Singular Devotion',
          summary: 'A single deep, clear line denotes unwavering dedication to a singular central union that anchors the emotional life.',
          detail: 'Brihat Samhita describes this as a mark of enduring fidelity, emotional contentment, and deep mutual understanding across decades.',
          element: 'Shukra & Budha (Venus & Mercury)',
          activeVsPassive: 'On the Right Hand, it promises stable matrimonial grounding. On the Left Hand, it reveals a soul blueprint geared for one lifelong soul companion.'
        }
      },
      {
        id: 'TWO_LINES',
        label: 'Two Distinct Lines',
        sanskritLabel: 'द्वि रेखा (Dvi Rekha)',
        desc: 'Two clear parallel lines reflecting distinct life chapters',
        variant: 'TWO_LINES',
        interpretation: {
          title: 'Dvi Parva — Dual Transformative Attachments',
          summary: 'Two distinct lines signify two significant chapters of emotional maturity and transformative relational growth.',
          detail: 'Classical interpreters explain that this configuration often indicates early lessons followed by an enlightened, lasting adult partnership.',
          element: 'Shukra (Venusian Evolution)',
          activeVsPassive: 'On the Right Hand, it reflects evolving relationship choices in the physical world. On the Left Hand, it mirrors two profound soul karmas.'
        }
      },
      {
        id: 'MULTI_LINES',
        label: 'Multiple Fine Lines',
        sanskritLabel: 'बहु रेखा (Bahu Rekha)',
        desc: 'Three or more fine stacked creases under Mercury mount',
        variant: 'MULTI_LINES',
        interpretation: {
          title: 'Bahu Sambandha — Multifaceted Interpersonal Growth',
          summary: 'Multiple fine lines reflect a socially vibrant, emotionally curious nature with diverse connections enriching life.',
          detail: 'Samudrika treatises state that this signifies someone who learns self-worth through diverse interpersonal mirrors before settling into tranquil companionship.',
          element: 'Budha (Mercurial Curiosity)',
          activeVsPassive: 'On the Right Hand, it shows an active social circle and widespread charisma. On the Left Hand, it denotes deep curiosity regarding human hearts.'
        }
      }
    ]
  },
  {
    id: 'fate_line',
    title: 'Destiny Line (Bhagya Rekha)',
    sanskritTitle: 'भाग्य रेखा / कर्म रेखा (Bhagya Rekha)',
    subtitle: 'Career trajectory, karmic calling, discipline and life purpose (Replaces Western "Destiny line")',
    artMode: 'OPEN_PALM',
    featureKey: 'FATE',
    options: [
      {
        id: 'CROSSES_PALM',
        label: 'Base to Saturn Mount',
        sanskritLabel: 'शनिमणिबन्ध रेखा (Saturn-Manibandha)',
        desc: 'Unbroken vertical ascent from the wrist straight to Saturn mount',
        variant: 'CROSSES_PALM',
        interpretation: {
          title: 'Purushartha — Self-Made Purpose & Early Calling',
          summary: 'An uninterrupted line rising from the wrist to Saturn denotes early clarity of vocational purpose and disciplined perseverance.',
          detail: 'Dr. N.D. Shrimali highlights that this signifies self-reliance, steady professional advancement, and the power to overcome early obstacles.',
          element: 'Shani (Saturnian Discipline)',
          activeVsPassive: 'On the Right Hand, it confirms steady worldly success achieved through personal grit. On the Left Hand, it represents strong inherent karmic drive.'
        }
      },
      {
        id: 'DOUBLE_LINE',
        label: 'Double Parallel Lines',
        sanskritLabel: 'द्वि भाग्य रेखा (Dvi Bhagya)',
        desc: 'Two parallel vertical paths ascending simultaneously',
        variant: 'DOUBLE_LINE',
        interpretation: {
          title: 'Ubhaya Karma — Dual Callings & Passions',
          summary: 'Parallel lines indicate dual careers, a secondary entrepreneurial venture, or a professional path paired with a spiritual vocation.',
          detail: 'Bhavishya Purana notes that two strong fate lines bestow remarkable multitasking vitality, allowing mastery across two separate disciplines.',
          element: 'Guru & Shani (Wisdom & Discipline)',
          activeVsPassive: 'On the Right Hand, it reflects dual revenue streams or careers. On the Left Hand, it marks a bridge between outer work and inner dharma.'
        }
      },
      {
        id: 'FROM_LUNA',
        label: 'Rising from Moon Mount',
        sanskritLabel: 'चन्द्रमूल रेखा (Chandra-Mula)',
        desc: 'Curves upward from the lower percussion (Mount of Luna)',
        variant: 'FROM_LUNA',
        interpretation: {
          title: 'Loka Sangraha — Public Rapport & Creative Fortune',
          summary: 'Origin on Chandra Kshetra indicates fortune amplified by public appreciation, creative innovation, and collaborative allies.',
          detail: 'Garuda Purana associates this ascent with artists, diplomats, and speakers whose career flourishes through popularity and societal support.',
          element: 'Chandra (Lunar Grace)',
          activeVsPassive: 'On the Right Hand, it reflects wide professional influence and client loyalty. On the Left Hand, it shows innate creative charm.'
        }
      },
      {
        id: 'CENTER_ONLY',
        label: 'Centered in Mid-Palm',
        sanskritLabel: 'मध्यम भाग्य (Madhyama Bhagya)',
        desc: 'Develops with strong clarity between Head and Heart lines',
        variant: 'CENTER_ONLY',
        interpretation: {
          title: 'Sva-Krita — Mature Awakening & Self-Forged Destiny',
          summary: 'A line strengthening in the palm center indicates that your true vocational calling crystallizes in maturity through conscious discernment.',
          detail: 'Traditional teachers praise this as the mark of late-blooming wisdom, where worldly experience converts into lasting accomplishment.',
          element: 'Surya (Solar Illumination)',
          activeVsPassive: 'On the Right Hand, it reflects rapid career ascent in your 30s and 40s. On the Left Hand, it shows purposeful soul patience.'
        }
      }
    ]
  },
  {
    id: 'life_line',
    title: 'Life Line (Jivita Rekha)',
    sanskritTitle: 'जीवित रेखा / आयुर् रेखा (Jivita Rekha)',
    subtitle: 'Prana vitality, constitutional reserve and physical grounding (Replaces Western "Earth line")',
    artMode: 'OPEN_PALM',
    featureKey: 'LIFE',
    options: [
      {
        id: 'WIDE_SWEEP',
        label: 'Wide Sweeping Arc',
        sanskritLabel: 'पूर्ण आयुर् रेखा (Purna Ayu)',
        desc: 'Expansive arc encompassing a generous Mount of Venus',
        variant: 'WIDE_SWEEP',
        interpretation: {
          title: 'Prana Shakti — Robust Vitality & Generous Spirit',
          summary: 'A generous sweeping arc reveals abundant constitutional reserves, zest for exploration, and a magnetic worldly presence.',
          detail: 'Brihat Samhita notes that an expansive Shukra Kshetra denotes generous hospitality, strong immune resilience, and a deep love for travel.',
          element: 'Prithvi & Shukra (Earth & Venus)',
          activeVsPassive: 'On the Right Hand, it demonstrates vigorous physical capacity and active lifestyle. On the Left Hand, it marks inherited robust vitality.'
        }
      },
      {
        id: 'NARROW_ARC',
        label: 'Compact Close to Thumb',
        sanskritLabel: 'मितायुस् रेखा (Mitaprana)',
        desc: 'Closer contour hugging the base of the thumb',
        variant: 'NARROW_ARC',
        interpretation: {
          title: 'Mitaprana — Conserved Energy & Reflective Poise',
          summary: 'A compact arc signifies mindful conservation of vital forces, preference for serene environments, and measured energy expenditure.',
          detail: 'Bhavishya Purana advises individuals with this contour to observe deliberate pacing, peaceful domestic routines, and nourishing rest.',
          element: 'Vayu (Air)',
          activeVsPassive: 'On the Right Hand, it shows prudent daily pacing and stress management. On the Left Hand, it reflects an introverted, meditative baseline.'
        }
      },
      {
        id: 'UPWARD_BRANCHES',
        label: 'Upward Branches to Jupiter',
        sanskritLabel: 'ऊर्ध्व शाखा (Urdhva Shakha)',
        desc: 'Ascending fine branches reaching toward Jupiter Mount',
        variant: 'UPWARD_BRANCHES',
        interpretation: {
          title: 'Urdhva Gati — Relentless Upward Aspiration',
          summary: 'Upward shooting rays ascending toward Guru signify continuous personal triumphs, educational growth, and high aspirational spirit.',
          detail: 'Classical texts celebrate upward branches as markers of self-elevation that convert every life difficulty into spiritual and worldly victory.',
          element: 'Guru & Agni (Jupiterian Fire)',
          activeVsPassive: 'On the Right Hand, it reflects concrete career achievements. On the Left Hand, it indicates an innate spiritual urge to rise above limitations.'
        }
      }
    ]
  }
];

/**
 * Generate full reading synthesis payload based on user answers
 */
export function generatePalmReadingDossier(answers = {}, selectedHand = 'RIGHT') {
  const isRight = selectedHand.toUpperCase() === 'RIGHT';
  const handTitle = isRight ? 'Dakshina Kara (Right Hand — Active Karma)' : 'Vama Kara (Left Hand — Innate Potential)';
  
  const results = PALM_READING_QUESTIONS.map(q => {
    const selectedOptId = answers[q.id] || q.options[0].id;
    const option = q.options.find(o => o.id === selectedOptId) || q.options[0];
    return {
      questionId: q.id,
      title: q.title,
      sanskritTitle: q.sanskritTitle,
      featureKey: q.featureKey,
      artMode: q.artMode,
      selectedOption: option,
      variant: option.variant
    };
  });

  return {
    hand: selectedHand,
    handTitle,
    timestamp: new Date().toISOString(),
    results,
    vedicSynthesis: `Based on Hasta Samudrika Shastra, the ${handTitle} reveals a harmonious constitutional alignment. Your conscious actions and innate saṃskāras operate in cooperative resonance, reflecting thoughtful discernment, steady vitality, and purposeful trajectory.`
  };
}
