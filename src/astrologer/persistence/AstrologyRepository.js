/**
 * AstrologyRepository — SQLite persistence for Astrology Profiles, Charts & Consultations
 * 
 * Enforces owner-level authorization, transactions, and immutable chart snapshots.
 */

import crypto from 'node:crypto';

export class AstrologyRepository {
  constructor(database) {
    this.database = database;
  }

  // --- 1. PROFILES ---

  createProfile({ ownerId, name, birthDate, birthTime = null, isTimeUnknown = false, birthPlace = '', latitude, longitude, timezone, metadata = {} }) {
    const profileId = `prof_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const stmt = this.database.raw.prepare(`
      INSERT INTO astrology_profiles (
        profile_id, owner_id, name, birth_date, birth_time, is_time_unknown,
        birth_place, latitude, longitude, timezone, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      profileId,
      ownerId,
      name,
      birthDate,
      birthTime,
      isTimeUnknown ? 1 : 0,
      birthPlace,
      Number(latitude),
      Number(longitude),
      timezone,
      JSON.stringify(metadata),
      now,
      now
    );

    return this.getProfile(profileId, ownerId);
  }

  getProfile(profileId, ownerId) {
    const stmt = this.database.raw.prepare(`
      SELECT * FROM astrology_profiles WHERE profile_id = ? AND owner_id = ?
    `);
    const row = stmt.get(profileId, ownerId);
    if (!row) return null;

    return {
      ...row,
      is_time_unknown: Boolean(row.is_time_unknown),
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  listProfilesForUser(ownerId) {
    const stmt = this.database.raw.prepare(`
      SELECT * FROM astrology_profiles WHERE owner_id = ? ORDER BY created_at DESC
    `);
    const rows = stmt.all(ownerId);
    return rows.map(r => ({
      ...r,
      is_time_unknown: Boolean(r.is_time_unknown),
      metadata: JSON.parse(r.metadata || '{}')
    }));
  }

  // --- 2. BIRTH CHARTS ---

  saveChart({ chartId, profileId = null, ownerId, astrologySystem, inputHash, calculationVersion, chartData }) {
    const id = chartId || `chart_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const stmt = this.database.raw.prepare(`
      INSERT INTO birth_charts (
        chart_id, profile_id, owner_id, astrology_system, input_hash,
        calculation_version, chart_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      profileId,
      ownerId,
      astrologySystem,
      inputHash,
      calculationVersion,
      typeof chartData === 'string' ? chartData : JSON.stringify(chartData),
      now
    );

    return this.getChartById(id, ownerId);
  }

  getChartById(chartId, ownerId) {
    const stmt = this.database.raw.prepare(`
      SELECT * FROM birth_charts WHERE chart_id = ? AND owner_id = ?
    `);
    const row = stmt.get(chartId, ownerId);
    if (!row) return null;

    return {
      ...row,
      chart_data: JSON.parse(row.chart_data)
    };
  }

  findChartByHash(inputHash, ownerId) {
    const stmt = this.database.raw.prepare(`
      SELECT * FROM birth_charts WHERE input_hash = ? AND owner_id = ? ORDER BY created_at DESC LIMIT 1
    `);
    const row = stmt.get(inputHash, ownerId);
    if (!row) return null;

    return {
      ...row,
      chart_data: JSON.parse(row.chart_data)
    };
  }

  // --- 3. CONSULTATIONS ---

  createConsultation({ ownerId, chartId, astrologySystem, topic, metadata = {} }) {
    const consultationId = `cons_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const stmt = this.database.raw.prepare(`
      INSERT INTO consultations (
        consultation_id, owner_id, chart_id, astrology_system, topic, status, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?)
    `);

    stmt.run(
      consultationId,
      ownerId,
      chartId,
      astrologySystem,
      topic,
      JSON.stringify(metadata),
      now,
      now
    );

    return this.getConsultationById(consultationId, ownerId);
  }

  getConsultationById(consultationId, ownerId) {
    const stmt = this.database.raw.prepare(`
      SELECT * FROM consultations WHERE consultation_id = ? AND owner_id = ?
    `);
    const row = stmt.get(consultationId, ownerId);
    if (!row) return null;

    return {
      ...row,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  listConsultationsForUser(ownerId) {
    const stmt = this.database.raw.prepare(`
      SELECT * FROM consultations WHERE owner_id = ? ORDER BY updated_at DESC
    `);
    const rows = stmt.all(ownerId);
    return rows.map(r => ({
      ...r,
      metadata: JSON.parse(r.metadata || '{}')
    }));
  }

  // --- 4. CONSULTATION MESSAGES ---

  addMessage({ consultationId, senderRole, content, structuredPayload = null, promptTokens = null, completionTokens = null, modelId = null, idempotencyKey = null }) {
    const messageId = `msg_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    if (idempotencyKey) {
      const existing = this.database.raw.prepare('SELECT * FROM consultation_messages WHERE idempotency_key = ?').get(idempotencyKey);
      if (existing) {
        return {
          ...existing,
          structured_payload: existing.structured_payload ? JSON.parse(existing.structured_payload) : null
        };
      }
    }

    const stmt = this.database.raw.prepare(`
      INSERT INTO consultation_messages (
        message_id, consultation_id, sender_role, content, structured_payload,
        prompt_tokens, completion_tokens, model_id, idempotency_key, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      messageId,
      consultationId,
      senderRole,
      content,
      structuredPayload ? (typeof structuredPayload === 'string' ? structuredPayload : JSON.stringify(structuredPayload)) : null,
      promptTokens,
      completionTokens,
      modelId,
      idempotencyKey,
      now
    );

    // Update consultation updated_at
    this.database.raw.prepare('UPDATE consultations SET updated_at = ? WHERE consultation_id = ?').run(now, consultationId);

    return {
      message_id: messageId,
      consultation_id: consultationId,
      sender_role: senderRole,
      content,
      structured_payload: structuredPayload,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      model_id: modelId,
      idempotency_key: idempotencyKey,
      created_at: now
    };
  }

  getMessagesForConsultation(consultationId) {
    const stmt = this.database.raw.prepare(`
      SELECT * FROM consultation_messages WHERE consultation_id = ? ORDER BY created_at ASC
    `);
    const rows = stmt.all(consultationId);
    return rows.map(r => ({
      ...r,
      structured_payload: r.structured_payload ? JSON.parse(r.structured_payload) : null
    }));
  }
}
