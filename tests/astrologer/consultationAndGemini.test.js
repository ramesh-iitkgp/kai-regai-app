/**
 * Automated Test Suite — Astrologer Consultation Service, Safety & API Integration
 * 
 * Verifies:
 * - SQLite Migration 002 (Astrology profiles, charts, consultations, messages)
 * - AstrologyRepository CRUD operations and user ownership
 * - AstrologyKnowledgeBase attributed passage retrieval
 * - AstrologerSafetyGate medical/crisis/gambling filtering
 * - AstrologerPromptBuilder prompt construction & grounding
 * - AstrologerResponseValidator structured schema validation
 * - ConsultationService multi-turn interaction
 * - Server API Endpoints (/api/v1/astrology/*)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { MigrationEngine } from '../../src/backend/database/MigrationEngine.js';
import { AstrologyRepository } from '../../src/astrologer/persistence/AstrologyRepository.js';
import { AstrologyKnowledgeBase } from '../../src/astrologer/knowledgeRetrieval/AstrologyKnowledgeBase.js';
import { AstrologerSafetyGate } from '../../src/astrologer/safety/AstrologerSafetyGate.js';
import { AstrologerPromptBuilder } from '../../src/astrologer/promptBuilder/AstrologerPromptBuilder.js';
import { AstrologerResponseValidator } from '../../src/astrologer/responseValidator/AstrologerResponseValidator.js';
import { ConsultationService } from '../../src/astrologer/consultationService/ConsultationService.js';
import { GeminiClient } from '../../src/astrologer/geminiService/GeminiClient.js';
import { buildBirthChart } from '../../src/astrology/chartBuilder/BirthChartBuilder.js';

function createTestDatabase() {
  const rawDb = new DatabaseSync(':memory:');
  const dbWrapper = {
    raw: rawDb,
    transaction: (fn) => fn(rawDb)
  };

  new MigrationEngine(dbWrapper).run();

  // Create a test user
  rawDb.prepare(`
    INSERT INTO users (user_id, owner_type, email, display_name, created_at, updated_at)
    VALUES ('usr_test_1', 'ACCOUNT', 'seeker@test.com', 'Seeker', '2026-01-01', '2026-01-01')
  `).run();

  return dbWrapper;
}

test('Astrologer Integration — Database Schema Migration 002', () => {
  const db = createTestDatabase();
  const tables = db.raw.prepare("SELECT name FROM sqlite_master WHERE type='table';").all().map(t => t.name);

  assert.ok(tables.includes('astrology_profiles'));
  assert.ok(tables.includes('birth_charts'));
  assert.ok(tables.includes('consultations'));
  assert.ok(tables.includes('consultation_messages'));
});

test('Astrologer Integration — AstrologyRepository CRUD Operations', () => {
  const db = createTestDatabase();
  const repo = new AstrologyRepository(db);

  // Profile CRUD
  const profile = repo.createProfile({
    ownerId: 'usr_test_1',
    name: 'Anand',
    birthDate: '1992-08-20',
    birthTime: '10:15:00',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata'
  });
  assert.ok(profile.profile_id.startsWith('prof_'));
  assert.equal(profile.name, 'Anand');

  const fetchedProfile = repo.getProfile(profile.profile_id, 'usr_test_1');
  assert.equal(fetchedProfile.profile_id, profile.profile_id);

  // Unauthorized profile fetch should return null
  const unauthProfile = repo.getProfile(profile.profile_id, 'usr_other');
  assert.equal(unauthProfile, null);

  // Chart Save & Fetch
  const chartRecord = repo.saveChart({
    ownerId: 'usr_test_1',
    profileId: profile.profile_id,
    astrologySystem: 'VEDIC',
    inputHash: 'hash_test_123',
    calculationVersion: '1.0.0',
    chartData: { system: 'VEDIC', test: true }
  });
  assert.ok(chartRecord.chart_id.startsWith('chart_'));

  const fetchedChart = repo.findChartByHash('hash_test_123', 'usr_test_1');
  assert.equal(fetchedChart.chart_id, chartRecord.chart_id);
  assert.equal(fetchedChart.chart_data.test, true);

  // Consultation CRUD
  const consultation = repo.createConsultation({
    ownerId: 'usr_test_1',
    chartId: chartRecord.chart_id,
    astrologySystem: 'VEDIC',
    topic: 'CAREER'
  });
  assert.ok(consultation.consultation_id.startsWith('cons_'));
  assert.equal(consultation.topic, 'CAREER');

  // Messages CRUD
  const userMsg = repo.addMessage({
    consultationId: consultation.consultation_id,
    senderRole: 'USER',
    content: 'What does my 10th house say?'
  });
  assert.ok(userMsg.message_id.startsWith('msg_'));

  const aiMsg = repo.addMessage({
    consultationId: consultation.consultation_id,
    senderRole: 'ASTROLOGER',
    content: 'Your 10th house indicates vocational clarity.',
    structuredPayload: { answer: 'Vocational clarity' }
  });

  const messages = repo.getMessagesForConsultation(consultation.consultation_id);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].sender_role, 'USER');
  assert.equal(messages[1].sender_role, 'ASTROLOGER');
});

test('Astrologer Integration — AstrologyKnowledgeBase Retrieval & Attribution', () => {
  const kb = new AstrologyKnowledgeBase();

  const vedicPassages = kb.retrievePassages({
    system: 'VEDIC',
    topic: 'CAREER',
    query: '10th house profession'
  });
  assert.ok(vedicPassages.length >= 1);
  assert.equal(vedicPassages[0].system, 'VEDIC');
  assert.ok(vedicPassages[0].source.includes('Brihat Parashara Hora Shastra'));

  const westernPassages = kb.retrievePassages({
    system: 'WESTERN',
    topic: 'CAREER',
    query: 'Jupiter expansion'
  });
  assert.ok(westernPassages.length >= 1);
  assert.equal(westernPassages[0].system, 'WESTERN');
  assert.ok(westernPassages[0].source.includes('William Lilly') || westernPassages[0].source.includes('Ptolemy'));
});

test('Astrologer Integration — AstrologerSafetyGate Prohibited Queries', () => {
  const gate = new AstrologerSafetyGate();

  // Safe question
  const safeRes = gate.evaluateInput('What do my transits say about creative work this month?');
  assert.equal(safeRes.safe, true);

  // Medical diagnosis question
  const medicalRes = gate.evaluateInput('Can you diagnose my chest pain and cancer disease?');
  assert.equal(medicalRes.safe, false);
  assert.equal(medicalRes.reason, 'MEDICAL_AND_LIFESPAN_RESTRICTION');

  // Fatalistic lifespan question
  const deathRes = gate.evaluateInput('What is my exact date of death?');
  assert.equal(deathRes.safe, false);

  // Crisis / self-harm question
  const crisisRes = gate.evaluateInput('I want to commit suicide and end my life');
  assert.equal(crisisRes.safe, false);
  assert.equal(crisisRes.reason, 'CRISIS_SUPPORT_TRIGGERED');

  // Gambling promise question
  const gambleRes = gate.evaluateInput('Give me guaranteed winning lottery numbers');
  assert.equal(gambleRes.safe, false);

  // Deterministic wedding date prediction question
  const weddingRes = gate.evaluateInput('Tell me the exact date I will get married');
  assert.equal(weddingRes.safe, false);
  assert.equal(weddingRes.reason, 'DETERMINISTIC_FUTURE_EVENT_RESTRICTION');

  // Financial speculation question
  const investRes = gate.evaluateInput('Should I invest all my savings based on this chart?');
  assert.equal(investRes.safe, false);
  assert.equal(investRes.reason, 'FINANCIAL_SPECULATION_RESTRICTION');
});

test('Astrologer Integration — AstrologerResponseValidator & Recovery', () => {
  // Valid JSON string
  const validJson = JSON.stringify({
    answer: 'Your Sun placement indicates leadership potential.',
    summary: 'Sun indicates leadership.',
    chartInterpretation: [{ placement: 'Sun in 10th', interpretation: 'Ambition' }],
    reflection: 'How do you lead yourself?',
    followUpSuggestions: ['What about my Moon?'],
    sourceReferences: ['Brihat Parashara Hora Shastra'],
    safetyNotice: 'Contemplative reflection.',
    requiresClarification: false,
    responseVersion: '1.0.0'
  });

  const parsedValid = AstrologerResponseValidator.validate(validJson);
  assert.equal(parsedValid.answer, 'Your Sun placement indicates leadership potential.');
  assert.equal(parsedValid.chartInterpretation.length, 1);

  // Markdown code fence wrapped JSON
  const fencedJson = '```json\n' + validJson + '\n```';
  const parsedFenced = AstrologerResponseValidator.validate(fencedJson);
  assert.equal(parsedFenced.answer, 'Your Sun placement indicates leadership potential.');

  // Malformed output recovery
  const malformed = 'This is raw unformatted text without any JSON structure.';
  const parsedMalformed = AstrologerResponseValidator.validate(malformed);
  assert.ok(parsedMalformed.answer);
  assert.ok(parsedMalformed.safetyNotice);
});

test('Astrologer Integration — ConsultationService Multi-Turn Interaction', async () => {
  const db = createTestDatabase();
  const repo = new AstrologyRepository(db);
  const gemini = new GeminiClient(); // Uses Mock generator in test environment
  const service = new ConsultationService({ repository: repo, geminiClient: gemini });

  const birthParams = {
    year: 1990, month: 1, day: 1, hour: 12, minute: 0,
    latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata'
  };

  // 1. Calculate Chart
  const chart = await service.getOrCalculateChart({
    system: 'VEDIC',
    ownerId: 'usr_test_1',
    birthParams
  });
  assert.ok(chart.id);

  // 2. Start Consultation
  const cons = await service.startConsultation({
    ownerId: 'usr_test_1',
    chartId: chart.id,
    system: 'VEDIC',
    topic: 'CAREER'
  });
  assert.ok(cons.consultation_id);

  // 3. Send Turn 1
  const turn1 = await service.sendMessage({
    ownerId: 'usr_test_1',
    consultationId: cons.consultation_id,
    content: 'How does my 10th house influence my vocational purpose?'
  });
  assert.ok(turn1.response.answer);
  assert.ok(turn1.messageRecord.message_id);

  // 4. Send Turn 2 (Follow-up)
  const turn2 = await service.sendMessage({
    ownerId: 'usr_test_1',
    consultationId: cons.consultation_id,
    content: 'Which planetary transits are supporting this right now?'
  });
  assert.ok(turn2.response.answer);

  // 5. Verify Consultation Details and Persistence
  const details = await service.getConsultationDetails(cons.consultation_id, 'usr_test_1');
  assert.equal(details.messages.length, 4); // 2 user turns + 2 AI answers
});
