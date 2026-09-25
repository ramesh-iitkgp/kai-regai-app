/**
 * Canonical PalmFeatureModel (P1/P2 Standard Contract)
 * Source of truth: docs/p2/DATA_FLOW.md & docs/ARCHITECTURE.md
 */

export class PalmFeatureModel {
  constructor(data = {}) {
    this.schema_version = data.schema_version || '2.0.0';
    this.session_id = data.session_id || '';
    this.timestamp = data.timestamp || new Date().toISOString();

    // Hand morphology and side
    this.hand = {
      side: data.hand?.side || 'RIGHT', // LEFT | RIGHT
      dominance: data.hand?.dominance || 'DOMINANT', // DOMINANT | PASSIVE
      elemental_shape: data.hand?.elemental_shape || 'FIRE', // EARTH | AIR | FIRE | WATER
      firmness: data.hand?.firmness || 'ELASTIC_RESILIENT',
      ratios: {
        palm_ratio: data.hand?.ratios?.palm_ratio ?? 1.05,
        finger_to_palm_ratio: data.hand?.ratios?.finger_to_palm_ratio ?? 0.82
      }
    };

    // Major palm crease lines (with semantic colors & geometry)
    this.major_lines = {
      life_line: {
        detected: data.major_lines?.life_line?.detected ?? true,
        length: data.major_lines?.life_line?.length || 'LONG_SWEEPING',
        curvature: data.major_lines?.life_line?.curvature || 'WIDE_ARC',
        depth: data.major_lines?.life_line?.depth || 'DEEP_CLEAR',
        confidence: data.major_lines?.life_line?.confidence ?? 0.94,
        semantic_color: '#A855F7', // Violet
        glyph: 'vitality'
      },
      head_line: {
        detected: data.major_lines?.head_line?.detected ?? true,
        length: data.major_lines?.head_line?.length || 'LONG',
        slope: data.major_lines?.head_line?.slope || 'GENTLE_SLOPE_TO_LUNA',
        clarity: data.major_lines?.head_line?.clarity || 'UNBROKEN',
        confidence: data.major_lines?.head_line?.confidence ?? 0.96,
        semantic_color: '#00D2FF', // Blue / Cyan
        glyph: 'intellect'
      },
      heart_line: {
        detected: data.major_lines?.heart_line?.detected ?? true,
        curvature: data.major_lines?.heart_line?.curvature || 'CURVED_TO_JUPITER',
        forking: data.major_lines?.heart_line?.forking || 'TRIDENT_TERMINATION',
        confidence: data.major_lines?.heart_line?.confidence ?? 0.92,
        semantic_color: '#F43F5E', // Rose
        glyph: 'emotion'
      },
      fate_line: {
        detected: data.major_lines?.fate_line?.detected ?? true,
        origin: data.major_lines?.fate_line?.origin || 'BASE_OF_PALM',
        destination: data.major_lines?.fate_line?.destination || 'MOUNT_OF_SATURN',
        continuity: data.major_lines?.fate_line?.continuity || 'STRONG_CENTRAL',
        confidence: data.major_lines?.fate_line?.confidence ?? 0.88,
        semantic_color: '#FBBF24', // Gold
        glyph: 'destiny'
      },
      sun_line: {
        detected: data.major_lines?.sun_line?.detected ?? true,
        strength: data.major_lines?.sun_line?.strength || 'PROMINENT_UPPER',
        destination: data.major_lines?.sun_line?.destination || 'MOUNT_OF_APOLLO',
        confidence: data.major_lines?.sun_line?.confidence ?? 0.85,
        semantic_color: '#F59E0B', // Amber
        glyph: 'radiance'
      }
    };

    // Thumb biomechanics and guided input
    this.thumb = {
      flexibility_angle: data.thumb?.flexibility_angle ?? 55, // degrees
      flexibility_type: data.thumb?.flexibility_type || 'SUPPLE_ADAPTIVE',
      first_phalanx_will: data.thumb?.first_phalanx_will || 'STRONG',
      second_phalanx_logic: data.thumb?.second_phalanx_logic || 'BALANCED'
    };

    // Traditional Mounts (Hasta Samudrika & Western)
    this.mounts = {
      jupiter: { development: 'WELL_DEVELOPED', quality: 'LEADERSHIP_EXPANSION' },
      saturn: { development: 'BALANCED', quality: 'DISCIPLINE_DEPTH' },
      apollo_sun: { development: 'PROMINENT', quality: 'CREATIVE_RADIANCE' },
      mercury: { development: 'WELL_DEVELOPED', quality: 'COMMUNICATION_INSIGHT' },
      venus: { development: 'FULL_WARM', quality: 'VITALITY_AFFECTION' },
      moon_luna: { development: 'EXPANSIVE', quality: 'INTUITION_IMAGINATION' }
    };

    // Special Markings (Trishula, Yav/Fish, Consecrated crosses)
    this.special_markings = data.special_markings || [
      { id: 'MARK-001', type: 'TRISHULA_TRIDENT', mount: 'JUPITER', tradition: 'HASTA_SAMUDRIKA' },
      { id: 'MARK-002', type: 'SOLOMON_RING', mount: 'JUPITER', tradition: 'WESTERN_CLASSICAL' }
    ];

    // Provenance & Quality
    this.quality_score = data.quality_score ?? 0.94;
    this.provenance = {
      mode: data.provenance?.mode || 'MODE_1_SCANNER',
      cv_version: '0.4.0-mock',
      knowledge_version: '1.1.0'
    };
  }
}
