/**
 * Mock Data Layer — Hastarekha Codex Library
 * Source of truth: docs/p1/ and docs/p2/INFORMATION_ARCHITECTURE.md
 */

export const mockCodex = {
  categories: [
    { id: 'lines', name: 'Major Lines', icon: 'gesture', count: 5 },
    { id: 'mounts', name: 'Celestial Mounts', icon: 'radio_button_checked', count: 8 },
    { id: 'hand', name: 'Hand Morphology', icon: 'back_hand', count: 4 },
    { id: 'markings', name: 'Sacred Markings', icon: 'auto_awesome', count: 6 },
    { id: 'traditions', name: 'Traditions & Texts', icon: 'menu_book', count: 4 }
  ],
  articles: [
    {
      id: 'art-life-line',
      category: 'lines',
      title: 'Ayur Rekha — The Life Line',
      subtitle: 'Vitality, Constitution & Bodily Harmony',
      color: '#A855F7',
      glyph: 'vitality',
      tradition: 'Hasta Samudrika & Western Classical',
      overview: 'The Life Line encircles the Mount of Venus at the base of the thumb. In ancient Indian chiromancy, it is revered as the Ayur Rekha—a dynamic energetic contour reflecting bodily vitality and physical resilience rather than a deterministic expiration date.',
      key_aspects: [
        { label: 'Wide Sweeping Arc', desc: 'Indicates expansive vitality, generous physical warmth, and strong recuperative energy.' },
        { label: 'Close to Thumb', desc: 'Reflects guarded physical boundaries, conserved stamina, and selective sensory exposure.' },
        { label: 'Ascending Branches', desc: 'Known as Urdhva Shakha in Vedic texts, denoting pivotal epochs of personal reinvention and self-willed triumph.' }
      ],
      historical_note: 'Detailed in Dr. N.D. Shrimali\'s "Practical Palmistry" and William G. Benham\'s foundational 1900 treatise.'
    },
    {
      id: 'art-head-line',
      category: 'lines',
      title: 'Matru Rekha — The Head Line',
      subtitle: 'Intellectual Topology & Cognitive Flow',
      color: '#00D2FF',
      glyph: 'intellect',
      tradition: 'Hasta Samudrika & Western Classical',
      overview: 'Traversing the central palm plain, the Head Line illustrates your cognitive operating system: whether the mind leans toward linear mathematical precision or downward into imaginative, poetic depths.',
      key_aspects: [
        { label: 'Straight & Horizontal', desc: 'Analytical pragmatism; assesses circumstances through empirical cause and effect.' },
        { label: 'Gentle Slope to Moon', desc: 'Lateral synthesis; effortlessly weaves emotional resonance into strategic logic.' },
        { label: 'Forked Termination', desc: 'The classic Saraswati Yoga or Writer\'s Fork; indicates dual fluency in abstract theory and expressive communication.' }
      ],
      historical_note: 'Attributed across both Pāṇilekhā Buddhist Sanskrit witnesses and Cheiro\'s Modern Western corpus.'
    },
    {
      id: 'art-heart-line',
      category: 'lines',
      title: 'Pitri / Hridaya Rekha — The Heart Line',
      subtitle: 'Affective Resonance & Relational Ethics',
      color: '#F43F5E',
      glyph: 'emotion',
      tradition: 'Hasta Samudrika & Western Classical',
      overview: 'Originating beneath the digit of Mercury (little finger) and extending toward the index finger, the Heart Line charts the soul\'s relational landscape and emotional boundaries.',
      key_aspects: [
        { label: 'Terminating on Jupiter', desc: 'Idealistic, devotional devotion; holds relational integrity to the highest ethical standard.' },
        { label: 'Terminating on Saturn', desc: 'Pragmatic, reserved emotional expression; prioritizes quiet constancy over performative drama.' },
        { label: 'Trident (Trishula) Ending', desc: 'Auspicious culmination blending passion, intellect, and spiritual beneficence.' }
      ],
      historical_note: 'Formally recorded in Western Classical literature as the Line of Mensa or Table Line.'
    },
    {
      id: 'art-fate-line',
      category: 'lines',
      title: 'Urdhva / Karma Rekha — The Fate Line',
      subtitle: 'Vocation, Dharma & Inner Focus',
      color: '#FBBF24',
      glyph: 'destiny',
      tradition: 'Hasta Samudrika (Bhavishya Purana)',
      overview: 'The vertical spire ascending toward the middle finger (Saturn). Unlike the foundational biological creases, the Fate Line can evolve and deepen as a person discovers and commits to their life calling.',
      key_aspects: [
        { label: 'Origin at Wrist', desc: 'Early clarity of vocation; sense of calling discovered in youth.' },
        { label: 'Origin at Mount of Moon', desc: 'Career driven by public collaboration, creative patrons, and social resonance.' },
        { label: 'Clear & Unbroken', desc: 'Strong internal momentum; ability to stay focused amid shifting external tides.' }
      ],
      historical_note: 'Vedic treatises connect this trajectory directly with Shani (Saturn) and purposeful duty.'
    },
    {
      id: 'art-sun-line',
      category: 'lines',
      title: 'Surya Rekha — The Sun Line',
      subtitle: 'Creative Renown & Radiant Vitality',
      color: '#F59E0B',
      glyph: 'radiance',
      tradition: 'Classical Hasta Samudrika',
      overview: 'Also termed the Line of Apollo or Line of Brilliance. Positioned beneath the ring finger, it highlights an individual\'s capacity to illuminate spaces, command aesthetic authority, and achieve public grace.',
      key_aspects: [
        { label: 'Prominent & Deep', desc: 'Charismatic public aura; natural magnetic authority in creative or executive spheres.' },
        { label: 'Multiple Parallel Filaments', desc: 'Versatile artistic sensibilities; multifaceted cultural and intellectual pursuits.' }
      ],
      historical_note: 'Associated in classical Indian palmistry with solar grace, honor, and benevolent prosperity.'
    }
  ]
};
