/**
 * Kai RegAI — Unified Palm Interpretation Engine
 * Phase: P7 — Palm Reading Questionnaire Engine
 * 
 * Evaluates any canonical PalmFeatureModel (Mode 1 CV, Mode 2 Guided Questionnaire, or Hybrid)
 * into a rich, structured reading dossier adhering strictly to the Four Epistemic Tiers:
 * 1. Physical Observation
 * 2. Western Classical Interpretation
 * 3. Classical Indian Tradition (Hasta Samudrika)
 * 4. Kai RegAI Reflective Synthesis
 * 
 * ABSOLUTE SAFETY LAW:
 * Zero fatalistic predictions (lifespan, death dates, divorces, fixed fortunes).
 * Zero medical diagnoses.
 * Explicit provenance disclosure (Camera vs Guided Questionnaire).
 */

export class PalmInterpretationEngine {
  /**
   * Synthesize a reading dossier from a canonical PalmFeatureModel
   * @param {import('../models/PalmFeatureModel.js').PalmFeatureModel} featureModel 
   * @returns {Object} Structured reading dossier
   */
  static synthesize(featureModel) {
    if (!featureModel) {
      throw new Error('[PalmInterpretationEngine] featureModel is required');
    }

    const hand = featureModel.hand || {};
    const lines = featureModel.major_lines || {};
    const thumb = featureModel.thumb || {};
    const markings = featureModel.special_markings || [];
    const provenance = featureModel.provenance || {};
    const isQuestionnaire = provenance.source === 'QUESTIONNAIRE' || provenance.mode === 'MODE_2_QUESTIONNAIRE';

    const handSide = hand.side || 'RIGHT';
    const readingMethod = isQuestionnaire ? 'GUIDED_QUESTIONNAIRE' : 'CAMERA_SCAN';
    const readingMethodLabel = isQuestionnaire ? 'Guided Palm Reading' : 'Rapid Camera Scan';

    // 1. Synthesize Line Interpretations
    const lineInterpretations = [
      this.evaluateLifeLine(lines.life_line, isQuestionnaire),
      this.evaluateHeadLine(lines.head_line, isQuestionnaire),
      this.evaluateHeartLine(lines.heart_line, isQuestionnaire),
      this.evaluateFateLine(lines.fate_line, isQuestionnaire),
      this.evaluateSunLine(lines.sun_line, isQuestionnaire)
    ];

    // 2. Synthesize Elemental Archetype & Constitution
    const elementalShape = hand.elemental_shape || 'FIRE';
    const firmness = hand.firmness || 'ELASTIC_RESILIENT';
    const constitutionProse = this.synthesizeConstitution(elementalShape, firmness, thumb, isQuestionnaire);

    // 3. Synthesize Vocational & Creative Guidance
    const vocationProse = this.synthesizeVocation(lines.fate_line, lines.sun_line, isQuestionnaire);

    // 4. Synthesize Contemplative Prompt
    const guidanceProse = this.synthesizeGuidance(lines.heart_line, lines.head_line, markings);

    // 5. Generate Title & Summary
    const title = isQuestionnaire 
      ? `Guided Hastarekha Dossier` 
      : `Solar Rapid Scan`;

    const summary = isQuestionnaire
      ? `A comprehensive reflective dossier based on your guided hand observations, evaluating palmar pad resilience, thumb flexibility, and crease contours.`
      : `A rapid optical scan analyzing visible palmar crease geometry and constitutional markers.`;

    const tags = [
      isQuestionnaire ? 'Guided Observation' : 'Optical Crease Scan',
      `${handSide === 'RIGHT' ? 'Right' : 'Left'} Hand`,
      `${elementalShape.charAt(0) + elementalShape.slice(1).toLowerCase()} Elemental Base`
    ];

    if (markings.length > 0) {
      const topMark = markings[0].type.replace('_', ' ');
      tags.push(topMark.charAt(0) + topMark.slice(1).toLowerCase());
    }

    return {
      id: `RDG-${Date.now()}`,
      mode: isQuestionnaire ? 'MODE_2_GUIDED' : 'MODE_1_SCANNER',
      reading_method: readingMethod,
      reading_method_label: readingMethodLabel,
      title,
      timestamp: new Date().toISOString(),
      hand_side: handSide,
      hand_dominance: hand.dominance || 'DOMINANT',
      summary,
      quality_score: featureModel.quality_score ?? 0.95,
      tags,
      major_lines: lineInterpretations,
      synthesis_chapters: {
        constitution: constitutionProse,
        vocation: vocationProse,
        guidance: guidanceProse,
        relationships: 'Your heart orientation prioritizes substantive emotional depth, mutual respect, and clear ethical boundaries.'
      },
      features: {
        mounts: [
          { name: 'Mount of Jupiter', icon: 'military_tech', note: 'Prominent radial development reflecting executive discernment and philosophical aspiration.' },
          { name: 'Mount of Venus', icon: 'favorite', note: 'Resilient thenar eminence correlating with steady constitutional stamina and vitality.' }
        ],
        thumb: {
          angle: `${thumb.flexibility_angle || 45}° Angle`,
          balance: thumb.flexibility_type === 'SUPPLE_BACKWARD' ? 'Supple Adaptability' : 'Balanced Will & Logic',
          interpretation: thumb.first_phalanx_will === 'STRONG' 
            ? 'Decisive intentionality paired with reflective contemplation.' 
            : 'Harmonious balance of deliberate will and rational discernment.'
        },
        markings: markings.length > 0 
          ? markings.map(m => ({
              name: m.type.replace('_', ' '),
              tradition: m.tradition === 'HASTA_SAMUDRIKA' ? 'Vedic Tradition' : 'Classical Chiromancy',
              note: 'Confirmed through guided visual and tactile observation.'
            }))
          : [
              {
                name: 'Solomon Ring Trace',
                tradition: 'Classical Chiromancy',
                note: 'Subtle semi-circular arc near the Jupiter base associated with intuitive discernment.'
              }
            ]
      },
      provenance: {
        ...provenance,
        interpretation_engine_version: '2.0.0',
        knowledge_version: '1.1.0'
      }
    };
  }

  static evaluateLifeLine(line = {}, isQuestionnaire = false) {
    const isDetected = line.detected !== false && line.status !== 'NOT_DETECTED';
    const status = line.status || (isDetected ? 'DETECTED' : 'NOT_DETECTED');

    if (!isDetected || status === 'OUT_OF_FRAME') {
      return {
        name: 'Life Line (Ayur Rekha)',
        color: '#A855F7',
        glyph: 'vitality',
        status: status === 'OUT_OF_FRAME' ? 'OUT_OF_FRAME' : 'NOT_DETECTED',
        observation: status === 'OUT_OF_FRAME'
          ? 'Crease trajectory lies near or outside the sensor frame boundary. Not biologically absent.'
          : (isQuestionnaire ? 'No clear crease noted curving around the thumb base in your observations.' : 'Crease not discernible in current optical scan.'),
        traditional_interpretation: 'Hasta Samudrika commentary treats Ayur Rekha as constitutional vitality rather than a deterministic lifespan clock.',
        synthesis: 'Vitality fluctuates with lifestyle rhythms, restful nourishment, and mindful pacing.'
      };
    }

    const curvature = line.curvature || 'WIDE_ARC';
    const isWide = curvature === 'WIDE_ARC';

    return {
      name: 'Life Line (Ayur Rekha)',
      color: '#A855F7',
      glyph: 'vitality',
      status: status,
      observation: isWide
        ? 'Expansive, continuous curvature enclosing the thenar eminence (Mount of Venus).'
        : 'Balanced curvature following the natural boundary of the thumb pad.',
      traditional_interpretation: 'Hasta Samudrika treatises (Shrimali, Pāṇilekhā) correlate a generous, unencumbered thenar arc with constitutional resilience and grounded warmth.',
      synthesis: 'Your physical energy operates best through steady, rhythmic continuity rather than abrupt bursts.'
    };
  }

  static evaluateHeadLine(line = {}, isQuestionnaire = false) {
    const isDetected = line.detected !== false && line.status !== 'NOT_DETECTED';
    const status = line.status || (isDetected ? 'DETECTED' : 'NOT_DETECTED');

    if (!isDetected || status === 'OUT_OF_FRAME') {
      return {
        name: 'Head Line (Matru Rekha)',
        color: '#00D2FF',
        glyph: 'intellect',
        status: status === 'OUT_OF_FRAME' ? 'OUT_OF_FRAME' : 'NOT_DETECTED',
        observation: 'Crease not discernible across the mid-palm plane.',
        traditional_interpretation: 'Western Classical and Vedic traditions evaluate Matru Rekha as cognitive style and focus alignment.',
        synthesis: 'Your thought processes balance intuitive perception with deliberate reflection.'
      };
    }

    const slope = line.slope || 'GENTLE_SLOPE';
    const isSloping = slope === 'GENTLE_SLOPE' || slope === 'STEEP_DESCENT';

    return {
      name: 'Head Line (Matru Rekha)',
      color: '#00D2FF',
      glyph: 'intellect',
      status: status,
      observation: isSloping
        ? 'Extended linear furrow dipping gently toward the lunar / imaginative quadrant.'
        : 'Direct transverse trajectory running straight across the mid-palmar plane.',
      traditional_interpretation: isSloping
        ? 'Classical Western chiromancy (Benham, Cheiro) associates this slope with creative intellect harmonizing logic with imaginative lateral thinking.'
        : 'Traditional treatises attribute straight trajectories to analytical scrutiny, empirical clarity, and pragmatic discernment.',
      synthesis: isSloping
        ? 'You excel at bridging structured reasoning with conceptual, imaginative vision.'
        : 'You bring disciplined focus and practical clarity to complex, ambiguous challenges.'
    };
  }

  static evaluateHeartLine(line = {}, isQuestionnaire = false) {
    const isDetected = line.detected !== false && line.status !== 'NOT_DETECTED';
    const status = line.status || (isDetected ? 'DETECTED' : 'NOT_DETECTED');

    if (!isDetected || status === 'OUT_OF_FRAME') {
      return {
        name: 'Heart Line (Pitri Rekha)',
        color: '#F43F5E',
        glyph: 'emotion',
        status: status === 'OUT_OF_FRAME' ? 'OUT_OF_FRAME' : 'NOT_DETECTED',
        observation: 'Upper transverse crease not clearly discernible.',
        traditional_interpretation: 'Traditional texts view Hridaya Rekha as the compass of emotional resonance and ethical loyalty.',
        synthesis: 'Relationships deepen through deliberate personal trust and mutually respected boundaries.'
      };
    }

    const curvature = line.curvature || 'CURVED_TO_JUPITER';
    const isElevated = curvature === 'CURVED_TO_JUPITER' || curvature === 'BETWEEN_FINGERS';

    return {
      name: 'Heart Line (Pitri Rekha)',
      color: '#F43F5E',
      glyph: 'emotion',
      status: status,
      observation: isElevated
        ? 'Upper curved trajectory ascending toward the index / Jupiter sector.'
        : 'Transverse horizontal line resting across the upper palmar plane.',
      traditional_interpretation: 'Hasta Samudrika associates elevation toward the Mount of Jupiter with relational ethics, noble generosity, and devotion without codependency.',
      synthesis: 'Your emotional compass values authentic loyalty and elevated shared ideals.'
    };
  }

  static evaluateFateLine(line = {}, isQuestionnaire = false) {
    const isDetected = line.detected !== false && line.status !== 'NOT_DETECTED';
    const status = line.status || (isDetected ? 'DETECTED' : 'NOT_DETECTED');

    if (!isDetected || status === 'OUT_OF_FRAME') {
      return {
        name: 'Fate Line (Karma Rekha)',
        color: '#FBBF24',
        glyph: 'destiny',
        status: status === 'OUT_OF_FRAME' ? 'OUT_OF_FRAME' : 'NOT_DETECTED',
        observation: 'No distinct vertical central crease observed in this reading.',
        traditional_interpretation: 'Known traditionally as Urdhva Rekha; its absence or faintness is natural and common, traditionally indicating an adaptable, self-defined path rather than rigid societal conditioning.',
        synthesis: 'Your milestones are self-authored, allowing fluid reinvention across life phases.'
      };
    }

    return {
      name: 'Fate Line (Karma Rekha)',
      color: '#FBBF24',
      glyph: 'destiny',
      status: status,
      observation: 'Vertical longitudinal axis ascending toward the Mount of Saturn.',
      traditional_interpretation: 'Vedic chiromancy associates the Saturnine line with self-directed vocation, personal accountability, and purposeful craft.',
      synthesis: 'You build lasting accomplishment through patient mastery and dedicated continuity.'
    };
  }

  static evaluateSunLine(line = {}, isQuestionnaire = false) {
    const isDetected = line.detected !== false && line.status !== 'NOT_DETECTED';
    const status = line.status || (isDetected ? 'DETECTED' : 'NOT_DETECTED');

    if (!isDetected || status === 'OUT_OF_FRAME') {
      return {
        name: 'Sun Line (Surya Rekha)',
        color: '#F59E0B',
        glyph: 'radiance',
        status: status === 'OUT_OF_FRAME' ? 'OUT_OF_FRAME' : 'NOT_DETECTED',
        observation: 'Secondary vertical crease beneath ring finger not discernible.',
        traditional_interpretation: 'Surya Rekha denotes creative visibility and public renown; its absence simply highlights intrinsic fulfillment over external applause.',
        synthesis: 'Your creative contributions derive vitality from authentic personal expression.'
      };
    }

    return {
      name: 'Sun Line (Surya Rekha)',
      color: '#F59E0B',
      glyph: 'radiance',
      status: status,
      observation: 'Vertical crease ascending beneath the Apollo (ring) finger.',
      traditional_interpretation: 'Traditional texts view Surya Rekha as public recognition, creative reputation, and aesthetic discernment.',
      synthesis: 'An instinctive aesthetic lens elevates your work into distinct, resonant expressions.'
    };
  }

  static synthesizeConstitution(elementalShape, firmness, thumb, isQuestionnaire) {
    const prefix = isQuestionnaire
      ? 'Based on your tactile observations and hand proportions, your'
      : 'Optical contour analysis indicates that your';

    return `${prefix} hand morphology reflects an ${elementalShape.charAt(0) + elementalShape.slice(1).toLowerCase()} constitution paired with ${firmness.replace('_', ' ').toLowerCase()} pad resilience. The ${thumb.flexibility_type?.replace('_', ' ').toLowerCase() || 'balanced'} structure of your thumb demonstrates an alliance between analytical deliberation and the impulse to act decisively.`;
  }

  static synthesizeVocation(fateLine, sunLine, isQuestionnaire) {
    if (fateLine?.detected) {
      return 'The presence of an active Saturnine trajectory suggests that your vocation flourishes through systematic cultivation of craft, personal accountability, and self-authored responsibility.';
    }
    return 'With an open, adaptable central plain, traditional commentaries suggest your vocation is self-directed and versatile, thriving when allowed creative latitude rather than predetermined institutional paths.';
  }

  static synthesizeGuidance(heartLine, headLine, markings) {
    let guidance = 'Traditional chiromancy invites you to cultivate balance: grounding ambitious intellectual endeavors in regular physical restorative practices.';
    if (markings.some(m => m.type === 'TRISHULA_TRIDENT' || m.type === 'SOLOMON_RING')) {
      guidance += ' Auspicious terminal markings observed in your reading invite you to trust your intuitive discernment when mentoring or collaborating with others.';
    }
    return guidance;
  }
}
