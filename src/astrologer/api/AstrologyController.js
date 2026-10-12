/**
 * AstrologyController — HTTP Controller for Astrology Calculations & Consultations
 * 
 * Enforces:
 * - Parameter validation
 * - User authorization
 * - Consistent JSON response formatting
 */

import { sendError } from '../../backend/api/middleware/errorHandler.js';

export class AstrologyController {
  constructor({ consultationService, repository }) {
    this.consultationService = consultationService;
    this.repository = repository;
  }

  // POST /api/v1/astrology/chart
  async calculateChart(req, res, body) {
    try {
      const ownerId = req.user?.userId;
      if (!body || !body.birthParams) {
        return sendError(res, new Error('400 Bad Request: birthParams is required'), req.id, 400);
      }

      const { birthParams, system = 'VEDIC', profileId = null } = body;
      const chart = await this.consultationService.getOrCalculateChart({
        system,
        ownerId,
        profileId,
        birthParams
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, chart }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }

  // GET /api/v1/astrology/charts/:id
  async getChart(req, res, chartId) {
    try {
      const ownerId = req.user?.userId;
      const chartRow = this.repository.getChartById(chartId, ownerId);
      if (!chartRow) {
        return sendError(res, new Error('404 Not Found: Chart not found or unauthorized'), req.id, 404);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, chart: chartRow.chart_data }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }

  // POST /api/v1/astrology/profiles
  async createProfile(req, res, body) {
    try {
      const ownerId = req.user?.userId;
      if (!body || !body.name || !body.birthDate || body.latitude === undefined || body.longitude === undefined) {
        return sendError(res, new Error('400 Bad Request: name, birthDate, latitude and longitude are required'), req.id, 400);
      }

      const profile = this.repository.createProfile({
        ownerId,
        name: body.name,
        birthDate: body.birthDate,
        birthTime: body.birthTime || null,
        isTimeUnknown: Boolean(body.isTimeUnknown),
        birthPlace: body.birthPlace || '',
        latitude: body.latitude,
        longitude: body.longitude,
        timezone: body.timezone || 'UTC',
        metadata: body.metadata || {}
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, profile }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }

  // GET /api/v1/astrology/profiles
  async listProfiles(req, res) {
    try {
      const ownerId = req.user?.userId;
      const profiles = this.repository.listProfilesForUser(ownerId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, profiles }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }

  // POST /api/v1/astrology/consultations
  async startConsultation(req, res, body) {
    try {
      const ownerId = req.user?.userId;
      if (!body || !body.chartId) {
        return sendError(res, new Error('400 Bad Request: chartId is required'), req.id, 400);
      }

      const consultation = await this.consultationService.startConsultation({
        ownerId,
        chartId: body.chartId,
        system: body.system || 'VEDIC',
        topic: body.topic || 'GENERAL'
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, consultation }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }

  // GET /api/v1/astrology/consultations
  async listConsultations(req, res) {
    try {
      const ownerId = req.user?.userId;
      const consultations = this.repository.listConsultationsForUser(ownerId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, consultations }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }

  // GET /api/v1/astrology/consultations/:id
  async getConsultation(req, res, consultationId) {
    try {
      const ownerId = req.user?.userId;
      const details = await this.consultationService.getConsultationDetails(consultationId, ownerId);
      if (!details) {
        return sendError(res, new Error('404 Not Found: Consultation not found or unauthorized'), req.id, 404);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...details }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }

  // POST /api/v1/astrology/consultations/:id/messages
  async sendMessage(req, res, consultationId, body) {
    try {
      const ownerId = req.user?.userId;
      if (!body || !body.content || typeof body.content !== 'string' || body.content.trim() === '') {
        return sendError(res, new Error('400 Bad Request: content is required'), req.id, 400);
      }

      const idempotencyKey = req.headers['idempotency-key'] || body.idempotencyKey || null;

      const result = await this.consultationService.sendMessage({
        ownerId,
        consultationId,
        content: body.content.trim(),
        idempotencyKey
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...result }));
    } catch (err) {
      return sendError(res, err, req.id, 500);
    }
  }
}
