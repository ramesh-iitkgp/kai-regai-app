/**
 * Kai RegAI — Reading Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { sendError } from '../middleware/errorHandler.js';

export class ReadingController {
  constructor(readingService) {
    this.readingService = readingService;
  }

  saveReading(req, res, body) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const result = this.readingService.saveReading(body, req.user.userId, req.id);
      res.writeHead(result.isDuplicate ? 200 : 201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  listReadings(req, res) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const list = typeof this.readingService.listReadings === 'function'
        ? this.readingService.listReadings(req.user.userId)
        : this.readingService.listUserReadings(req.user.userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: list
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  getReading(req, res, readingId) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const reading = this.readingService.getReading(readingId, req.user.userId);
      if (!reading) {
        throw new Error('404 Not Found: Reading does not exist');
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: reading
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  deleteReading(req, res, readingId) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const success = this.readingService.deleteReading(readingId, req.user.userId, req.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success,
        message: 'Reading deleted successfully'
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }

  exportReading(req, res, readingId) {
    try {
      if (!req.user) {
        throw new Error('401 Unauthorized: Session required');
      }

      const exportBundle = this.readingService.exportReading(readingId, req.user.userId, req.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: exportBundle
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }
}
