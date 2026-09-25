/**
 * Kai RegAI — Knowledge Codex Manifest
 * Phase: P8 — Interpretation / Rule Engine & Knowledge Codex Matching
 * 
 * Defines metadata, supported tradition sources, schema version,
 * domain taxonomy, and rule registry.
 */

export const CODEX_MANIFEST = {
  id: 'KAI_REGAI_CODEX',
  name: 'Kai RegAI Master Palmistry Codex',
  version: '1.0.0',
  schemaVersion: '1.0.0',
  lastUpdated: '2026-09-25T12:00:00Z',
  
  sources: [
    {
      id: 'SRC_WESTERN_CLASSICAL',
      name: 'Western Classical Chiromancy',
      shortName: 'Western Classical',
      tier: 2,
      authorities: [
        'William G. Benham (1900)',
        'Cheiro / Count Louis Hamon (1897, 1916)',
        'Casimir Stanislas D\'Arpentigny (1839)',
        'Fred Gettings (1979)'
      ]
    },
    {
      id: 'SRC_HASTA_SAMUDRIKA',
      name: 'Traditional Indian Chiromancy (Hasta Samudrika)',
      shortName: 'Hasta Samudrika',
      tier: 3,
      authorities: [
        'Bhavishya Purana (Samudrika Khanda)',
        'Garuda Purana',
        'Pāṇilekhā Sanskrit Witnesses',
        'Dr. Narayan Dutt Shrimali (1980)'
      ]
    },
    {
      id: 'SRC_KAI_REGAI_SYNTHESIS',
      name: 'Kai RegAI Reflective Personal Synthesis',
      shortName: 'Kai RegAI Synthesis',
      tier: 4,
      authorities: [
        'Kai RegAI Unified Knowledge Architecture (2026)'
      ]
    }
  ],

  domains: [
    'LIFE_LINE',
    'HEAD_LINE',
    'HEART_LINE',
    'FATE_LINE',
    'SUN_LINE',
    'HAND_MORPHOLOGY',
    'THUMB',
    'MOUNTS',
    'SPECIAL_MARKINGS',
    'CROSS_LINE_SYNTHESIS'
  ]
};
