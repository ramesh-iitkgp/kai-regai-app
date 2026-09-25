/**
 * Kai RegAI — Palm Computer Vision Canonical Types & Contracts
 * Phase: P5 — Palm Computer Vision Engine
 * Version: 5.0.0
 * 
 * Strict architectural boundaries:
 * - Geometric and structural evidence only.
 * - Zero palmistry interpretation, symbolism, or prediction.
 * - All quality scores represent optical/image fidelity, never reading accuracy.
 */

/**
 * @typedef {Object} Point
 * @property {number} x - X coordinate in normalized [0, 1] or pixel coordinates
 * @property {number} y - Y coordinate in normalized [0, 1] or pixel coordinates
 */

/**
 * @typedef {Object} BoundingBox
 * @property {number} x - Top-left X coordinate
 * @property {number} y - Top-left Y coordinate
 * @property {number} width - Bounding box width
 * @property {number} height - Bounding box height
 */

/**
 * @typedef {Object} PalmImage
 * @property {number} width - Image width in pixels
 * @property {number} height - Image height in pixels
 * @property {Uint8ClampedArray} data - RGBA pixel buffer (length = width * height * 4)
 * @property {number} [channels=4] - Number of color channels (default 4 for RGBA)
 * @property {string} [colorSpace='srgb'] - Color space
 * @property {Object} [metadata] - Source metadata (orientation, source format, timestamp)
 */

/**
 * @typedef {Object} ImageQualityResult
 * @property {number} score - Composite optical quality score [0, 1]
 * @property {number} sharpness - Laplacian variance edge sharpness [0, 1]
 * @property {number} illumination - Mean exposure balance [0, 1]
 * @property {number} contrast - Dynamic range / histogram contrast [0, 1]
 * @property {number} glare - Freedom from specular reflection/saturation [0, 1] (1 = no glare)
 * @property {number} framing - Palm centration and boundary clearance [0, 1]
 * @property {number} resolution - Effective spatial resolution score [0, 1]
 * @property {number} occlusion - Freedom from foreign objects/jewelry [0, 1]
 * @property {boolean} passed - True if image clears all minimum optical thresholds
 * @property {string[]} reasons - Diagnostic reason codes if failed or degraded
 * @property {string[]} recommendations - Actionable user guidance (e.g., "Hold still")
 */

/**
 * @typedef {Object} PalmLandmark
 * @property {number} id - Canonical landmark index (0 to 20)
 * @property {string} name - Anatomical name (e.g., 'WRIST', 'THUMB_CMC', 'INDEX_MCP')
 * @property {number} x - Normalized X coordinate [0, 1]
 * @property {number} y - Normalized Y coordinate [0, 1]
 * @property {number} [z] - Estimated depth relative to wrist
 * @property {number} visibility - Landmark detection confidence [0, 1]
 */

/**
 * @typedef {'LEFT' | 'RIGHT' | 'UNKNOWN'} Handedness
 */

/**
 * @typedef {Object} HandDetectionResult
 * @property {boolean} detected - True if a hand is positively located
 * @property {Handedness} handedness - Hand side (LEFT, RIGHT, or UNKNOWN)
 * @property {BoundingBox} [boundingBox] - Hand bounding box
 * @property {number} confidence - Detection confidence score [0, 1]
 * @property {PalmLandmark[]} [landmarks] - 21-point anatomical landmarks if available
 */

/**
 * @typedef {Object} PalmROI
 * @property {Uint8Array} mask - Binary/alpha palm surface mask (0 = background, 255 = palm)
 * @property {BoundingBox} boundingBox - Cropped palmar surface bounding box
 * @property {PalmLandmark[]} landmarks - Rectified landmarks on canonical coordinate system
 * @property {number} orientation - Rotation angle in radians needed to align wrist-to-middle finger vertically
 * @property {number} scale - Scale factor applied during normalization
 */

/**
 * @typedef {Object} CreaseCandidate
 * @property {string} id - Unique identifier for candidate segment
 * @property {Point[]} polyline - Sequential coordinate vertices along crease centerline
 * @property {number} confidence - Detection confidence score [0, 1]
 * @property {number} length - Polyline arc length in pixels
 * @property {number} continuity - Unbroken continuity score [0, 1]
 * @property {number} curvature - Total curvature metric
 * @property {number} averageWidth - Estimated average crease furrow width in pixels
 * @property {number} contrast - Local ridge-to-valley intensity difference
 * @property {number[]} orientationProfile - Angular histogram along the path
 * @property {Point[]} branchPoints - Bifurcations and intersection nodes
 * @property {string[]} sourceScales - Filter scales where candidate was detected ('fine', 'medium', 'coarse')
 */

/**
 * @typedef {'LIFE' | 'HEAD' | 'HEART' | 'FATE' | 'SUN'} MajorLineType
 */

/**
 * @typedef {'DETECTED' | 'WEAK' | 'PARTIAL' | 'NOT_DETECTED' | 'AMBIGUOUS'} MajorLineStatus
 */

/**
 * @typedef {Object} MajorPalmLine
 * @property {MajorLineType} type - Line identifier
 * @property {MajorLineStatus} status - Detection status
 * @property {Point[]} polyline - Sequential points defining the centerline trajectory (empty if NOT_DETECTED)
 * @property {number} confidence - Geometric evidence confidence [0, 1]
 * @property {number} continuity - Line unbrokenness score [0, 1]
 * @property {number} visibility - Saliency and contrast relative to background skin [0, 1]
 * @property {Object} evidence - Quantitative measurement scores
 * @property {number} evidence.contrast - Local intensity gradient across crease
 * @property {number} evidence.structuralScore - Multi-scale ridge coherence
 * @property {number} evidence.geometricPriorScore - Agreement with anatomical starting/ending zones
 * @property {number} evidence.landmarkRelationScore - Proximity/alignment to key skeletal landmarks
 */

/**
 * @typedef {'PROCEED' | 'RECAPTURE' | 'USER_CORRECTION' | 'INSUFFICIENT_EVIDENCE'} PalmUsabilityAction
 */

/**
 * @typedef {Object} PalmUsabilityDetails
 * @property {number} palmAreaFraction - Palm coverage relative to frame area [0, 1]
 * @property {number} tiltAngleDeg - Hand tilt angle in degrees relative to vertical
 * @property {boolean} wristVisible - Whether wrist emergence is within frame
 * @property {boolean} isMultiHand - Whether multiple hands are present
 * @property {boolean} isCropped - Whether major palm margins are clipped
 * @property {Record<MajorLineType, boolean>} visibleRegions - Visibility of anatomical line regions
 */

/**
 * @typedef {Object} PalmUsabilityResult
 * @property {boolean} usable - True if palm region contains sufficient usable area
 * @property {number} score - Usability confidence score [0, 1]
 * @property {string[]} reasons - Diagnostic reason codes if unusable
 * @property {string[]} warnings - Advisory warnings (e.g. PARTIAL_WRIST_VISIBILITY)
 * @property {PalmUsabilityAction} recommendedAction - Recommended next action
 * @property {PalmUsabilityDetails} details - Granular usability metrics
 */

/**
 * @typedef {Object} RetakeDecision
 * @property {PalmUsabilityAction} action - Recommended action
 * @property {boolean} needsRetake - True if user must recapture
 * @property {string} primaryMessage - User-friendly primary guidance message
 * @property {string[]} detailedGuidance - Specific instructions to fix the capture
 * @property {string} diagnosticCode - Internal failure taxonomy / diagnostic code
 */

/**
 * @typedef {'SUCCESS' | 'RECAPTURE_REQUIRED' | 'NO_HAND' | 'INSUFFICIENT_EVIDENCE' | 'PROCESSING_ERROR'} VisionStatus
 */

/**
 * @typedef {Object} PalmVisionResult
 * @property {VisionStatus} status - High-level execution status
 * @property {ImageQualityResult} imageQuality - Optical quality metrics
 * @property {HandDetectionResult} hand - Hand localization and handedness
 * @property {PalmROI} [palm] - Segmented and rectified palmar ROI
 * @property {PalmUsabilityResult} [usability] - Palm region usability and coverage assessment
 * @property {RetakeDecision} [retakeDecision] - Actionable recapture guidance
 * @property {Object} lines - Extracted major crease geometry
 * @property {MajorPalmLine} lines.life - Life Line (Ayur Rekha)
 * @property {MajorPalmLine} lines.head - Head Line (Matru Rekha)
 * @property {MajorPalmLine} lines.heart - Heart Line (Pitri/Hridaya Rekha)
 * @property {MajorPalmLine} lines.fate - Fate Line (Urdhva/Karma Rekha)
 * @property {MajorPalmLine} lines.sun - Sun Line (Surya Rekha)
 * @property {Object} processing - Telemetry & execution profiling
 * @property {number} processing.durationMs - Total pipeline runtime in milliseconds
 * @property {string} processing.engineVersion - Engine semantic version (e.g., 'p5.2.0')
 * @property {Record<string, number>} [processing.stageTimingsMs] - Granular per-stage execution times
 * @property {Object} [diagnostics] - Extended developer diagnostics for P5.2
 */

export const PALM_CV_ENGINE_VERSION = 'p5.2.0';

