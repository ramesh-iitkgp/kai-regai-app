/**
 * Kai RegAI — Webhook Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

import { sendError } from '../middleware/errorHandler.js';

export class WebhookController {
  constructor(webhookService) {
    this.webhookService = webhookService;
  }

  handleWebhook(req, res, provider, rawBody) {
    try {
      const signature = req.headers['x-signature'] ||
                        req.headers['stripe-signature'] ||
                        req.headers['x-provider-signature'] || '';

      const result = this.webhookService.processWebhook({
        provider,
        rawPayload: rawBody,
        signature,
        requestId: req.id
      });

      res.writeHead(result.isDuplicate ? 200 : 201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result
      }));
    } catch (err) {
      sendError(res, err, req.id);
    }
  }
}
