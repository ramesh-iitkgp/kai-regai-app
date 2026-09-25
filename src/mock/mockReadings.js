/**
 * Mock Data Layer — Complete Reading Reports & History
 * Adheres strictly to the 4 epistemic language tiers defined in docs/p2/REPORT_ARCHITECTURE.md
 */

export const mockReadings = [
  {
    id: 'RDG-2026-0924-001',
    mode: 'MODE_1_SCANNER',
    title: 'Solar Quick Scan',
    timestamp: '2026-09-24T18:42:00Z',
    hand_side: 'RIGHT',
    hand_dominance: 'DOMINANT',
    summary: 'A robust vitality arc supported by a downward sloping creative head line, denoting high stamina and imaginative pragmatism.',
    quality_score: 0.94,
    tags: ['Expansive Vitality', 'Creative Intellect', 'Vedic Solar Line'],
    major_lines: [
      {
        name: 'Life Line',
        color: '#A855F7',
        glyph: 'vitality',
        observation: 'Deep, unbroken sweep encircling the full Mount of Venus.',
        traditional_interpretation: 'Hasta Samudrika identifies this as Ayur Rekha denoting robust constitutional vitality and grounded physical endurance.',
        synthesis: 'Your energy cycles reflect a strong biological reserve, sustained best through steady rhythmic focus rather than sporadic bursts.'
      },
      {
        name: 'Head Line',
        color: '#00D2FF',
        glyph: 'intellect',
        observation: 'Extended linear trajectory branching gently towards the upper Mount of Moon.',
        traditional_interpretation: 'Western Classical chiromancy attributes this configuration to creative intellect balancing mathematical logic with lateral intuition.',
        synthesis: 'You possess a dual cognitive style: rigorous structural reasoning combined with fertile problem-solving.'
      },
      {
        name: 'Heart Line',
        color: '#F43F5E',
        glyph: 'emotion',
        observation: 'Curving upward directly beneath the Mount of Jupiter with a triple terminal fork.',
        traditional_interpretation: 'Classic traditions (Shrimali, Benham) regard this as the Trishula or ideal devotion fork, indicating high relational ethics.',
        synthesis: 'High emotional discrimination: generous once trust is forged, with an intuitive compass for personal boundaries.'
      },
      {
        name: 'Fate Line',
        color: '#FBBF24',
        glyph: 'destiny',
        observation: 'Crisp vertical axis ascending unbroken into the Mount of Saturn.',
        traditional_interpretation: 'Known as the Urdhva Rekha or Saturnine path, reflecting a self-directed vocation with deep personal accountability.',
        synthesis: 'Career milestones are strongly self-authored; stability flourishes through systematic cultivation of craft.'
      },
      {
        name: 'Sun Line',
        color: '#F59E0B',
        glyph: 'radiance',
        observation: 'Distinct secondary luminary crease rising from the heart plane toward Apollo.',
        traditional_interpretation: 'Traditional Surya Rekha signifying creative reputation, aesthetic discernment, and public recognition.',
        synthesis: 'An instinctive aesthetic lens that elevates collaborative endeavors into distinct, resonant expressions.'
      }
    ],
    synthesis_chapters: {
      constitution: 'Your physical hand architecture belongs to the Fire-Earth hybrid morphology: broad grounded palms paired with agile, expressive phalanges. This combines deep stamina with sudden intuitive initiative.',
      vocation: 'The central alignment of your Saturnine trajectory suggests that multi-disciplinary mastery brings greater fulfillment than narrow specialization.',
      guidance: 'Traditional commentaries suggest honoring periodic contemplative retreats to recharge the luminous Apollo sector.'
    }
  },
  {
    id: 'RDG-2026-0922-002',
    mode: 'MODE_2_GUIDED',
    title: 'Illuminated Hastarekha Dossier',
    timestamp: '2026-09-22T14:15:00Z',
    hand_side: 'RIGHT',
    hand_dominance: 'DOMINANT',
    summary: 'Comprehensive 7-chapter personal reading incorporating tactile palm firmness, thumb flexibility metrics, and sacred Jupiter mount geometry.',
    quality_score: 0.98,
    tags: ['Guided In-Depth', 'Trident Marking', 'Supple Thumb', 'Vedic Synthesis'],
    major_lines: [
      {
        name: 'Life Line',
        color: '#A855F7',
        glyph: 'vitality',
        observation: 'Expansive arc with fine supplementary upward influence branches.',
        traditional_interpretation: 'Hasta Samudrika (Shrimali) records upward branches as Urdhva Shakha, traditionally marking energetic breakthroughs and self-directed renewal.',
        synthesis: 'A resilient physical vessel that rejuvenates through purposeful action.'
      },
      {
        name: 'Head Line',
        color: '#00D2FF',
        glyph: 'intellect',
        observation: 'Continuous, luminous channel with a subtle bifurcation near the Luna boundary.',
        traditional_interpretation: 'The "Writer\'s Fork" in Western Chiromancy and Saraswati Yoga in traditional Indian treatises, signaling linguistic or structural facility.',
        synthesis: 'You excel at articulating complex, nuanced ideas into accessible, beautiful structures.'
      },
      {
        name: 'Heart Line',
        color: '#F43F5E',
        glyph: 'emotion',
        observation: 'Ascending toward Jupiter with balanced depth and clear margins.',
        traditional_interpretation: 'Signifies emotional clarity and devotion without codependency.',
        synthesis: 'Your relationships operate as sacred spaces of mutual elevation.'
      },
      {
        name: 'Fate Line',
        color: '#FBBF24',
        glyph: 'destiny',
        observation: 'Deep central conduit originating near the wrist and terminating at Saturn.',
        traditional_interpretation: 'Unbroken karmic trajectory indicating continuous progression through self-discipline.',
        synthesis: 'Your vocation deepens in authority and clarity over time.'
      },
      {
        name: 'Sun Line',
        color: '#F59E0B',
        glyph: 'radiance',
        observation: 'Double parallel filaments beneath the fourth digit.',
        traditional_interpretation: 'Twin Surya Rekha associated with parallel creative gifts and cultural appreciation.',
        synthesis: 'A talent for infusing technical rigor with poetic aesthetic warmth.'
      }
    ],
    features: {
      mounts: [
        { name: 'Mount of Jupiter', note: 'Prominent elevation indicating inherent mentorship instinct and philosophical curiosity.', icon: 'star' },
        { name: 'Mount of Venus', note: 'Supple, warm elevation reflecting affection, aesthetic taste, and physical stamina.', icon: 'favorite' },
        { name: 'Mount of Moon', note: 'Expansive perimeter pointing to deep imaginative reserves and reflective night intellect.', icon: 'dark_mode' },
        { name: 'Mount of Mercury', note: 'Sharp definition correlated with strategic diplomacy and persuasive clarity.', icon: 'bolt' }
      ],
      thumb: {
        angle: '58° (Supple Arc)',
        balance: 'Equilateral Will & Logic',
        interpretation: 'A flexible thumb angle paired with balanced phalanges reveals intellectual adaptability: able to pivot strategies without compromising foundational ideals.'
      },
      markings: [
        { name: 'Trishula (Trident) at Jupiter', tradition: 'Hasta Samudrika', note: 'Ancient sign of wisdom, benevolent leadership, and honorable prosperity.' },
        { name: 'Solomon Ring', tradition: 'Western Classical', note: 'Curved halo beneath index finger indicating psychological acumen and empathic insight.' }
      ]
    },
    synthesis_chapters: {
      constitution: 'Your hand structure reflects the harmonious integration of grounded earthiness and celestial fire. Natural vitality supports ambitious intellectual enterprises.',
      vocation: 'The Urdhva trajectory reveals an intrinsic desire to build lasting artifacts—systems, works of art, or institutions that outlive temporal trends.',
      relationships: 'The elevated Jupiterian heart terminal values loyalty and intellectual companionship above all superficial connections.',
      guidance: 'Honor your reflective nocturnal rhythms; moments of solitude recharge your creative solar battery.'
    }
  }
];
