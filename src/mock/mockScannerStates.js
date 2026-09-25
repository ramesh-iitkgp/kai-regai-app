/**
 * Mock Data Layer — Scanner States and 10-Second Analysis Choreography
 * Source of truth: docs/p2/STATE_MACHINE.md & docs/p2/HAND_SCANNER_FLOW.md
 */

export const ScannerCameraStates = {
  CAMERA_INITIALIZING: 'CAMERA_INITIALIZING',
  NO_HAND: 'NO_HAND',
  HAND_PARTIALLY_VISIBLE: 'HAND_PARTIALLY_VISIBLE',
  MULTIPLE_HANDS: 'MULTIPLE_HANDS',
  HAND_TOO_FAR: 'HAND_TOO_FAR',
  HAND_TOO_CLOSE: 'HAND_TOO_CLOSE',
  LOW_LIGHT: 'LOW_LIGHT',
  BLURRY: 'BLURRY',
  HAND_READY: 'HAND_READY',
  SCANNING_ACTIVE: 'SCANNING_ACTIVE',
  ANALYZING_PROGRESSIVE: 'ANALYZING_PROGRESSIVE',
  COMPLETE: 'COMPLETE',
  ERROR_RECOVERY: 'ERROR_RECOVERY'
};

export const scannerTimelineSteps = [
  { step: 1, timeRange: '0.0s – 2.0s', line: null, title: 'Detecting Palm Geometry', subtitle: 'Aligning 21 anatomical landmarks & Mount plane', progress: 15 },
  { step: 2, timeRange: '2.0s – 4.0s', line: 'LIFE_LINE', title: 'Tracing Ayur Rekha (Life Line)', subtitle: 'Measuring vital arc & constitutional breadth', color: '#A855F7', progress: 35 },
  { step: 3, timeRange: '4.0s – 5.5s', line: 'HEAD_LINE', title: 'Extracting Matru Rekha (Head Line)', subtitle: 'Evaluating cognitive trajectory & Moonward slope', color: '#00D2FF', progress: 55 },
  { step: 4, timeRange: '5.5s – 7.0s', line: 'HEART_LINE', title: 'Mapping Pitri Rekha (Heart Line)', subtitle: 'Tracing relational curvature toward Mount of Jupiter', color: '#F43F5E', progress: 75 },
  { step: 5, timeRange: '7.0s – 8.5s', line: 'FATE_SUN', title: 'Calibrating Fate & Solar Spire', subtitle: 'Analyzing Saturnine karma & Surya radiance marks', color: '#FBBF24', progress: 90 },
  { step: 6, timeRange: '8.5s – 10.0s', line: null, title: 'Synthesizing Palm Profile', subtitle: 'Querying traditional Vedic rules & modern chiromancy', progress: 100 }
];
