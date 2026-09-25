/**
 * Kai RegAI — HTTP Backend Server
 * Phase: P13 — Production Backend & Commercial Authority
 */

import http from 'node:http';
import { Database } from '../database/Database.js';
import { MigrationEngine } from '../database/MigrationEngine.js';
import { CONFIG } from '../config.js';

import { AuditService } from '../services/AuditService.js';
import { AuthService } from '../services/AuthService.js';
import { ReadingService } from '../services/ReadingService.js';
import { CommerceService } from '../services/CommerceService.js';
import { SyncService } from '../services/SyncService.js';
import { WebhookService } from '../services/WebhookService.js';

import { AuthController } from './controllers/AuthController.js';
import { UserController } from './controllers/UserController.js';
import { ReadingController } from './controllers/ReadingController.js';
import { SyncController } from './controllers/SyncController.js';
import { TransactionController } from './controllers/TransactionController.js';
import { EntitlementController } from './controllers/EntitlementController.js';
import { WebhookController } from './controllers/WebhookController.js';
import { HealthController } from './controllers/HealthController.js';

import { ApiRouter } from './ApiRouter.js';

export class Server {
  constructor(options = {}) {
    this.port = options.port || CONFIG.port;
    this.host = options.host || CONFIG.host;
    this.dbPath = options.dbPath || CONFIG.databasePath;
    this.webhookSecret = options.webhookSecret || CONFIG.webhookSecret;

    this.database = new Database(this.dbPath);
    this.httpServer = null;
  }

  async init() {
    // 1. Initialize SQLite Database & Run Migrations
    this.database.init();
    const migrationEngine = new MigrationEngine(this.database);
    migrationEngine.run();

    // 2. Initialize Core Services
    this.auditService = new AuditService(this.database);
    this.authService = new AuthService(this.database, this.auditService);
    this.readingService = new ReadingService(this.database, this.auditService);
    this.commerceService = new CommerceService(this.database, this.auditService);
    this.syncService = new SyncService(this.database, this.readingService, this.auditService);
    this.webhookService = new WebhookService(
      this.database,
      this.commerceService,
      this.auditService,
      this.webhookSecret
    );

    // 3. Initialize Controllers
    const controllers = {
      authController: new AuthController(this.authService),
      userController: new UserController(this.database, this.auditService),
      readingController: new ReadingController(this.readingService),
      syncController: new SyncController(this.syncService),
      transactionController: new TransactionController(this.commerceService),
      entitlementController: new EntitlementController(this.commerceService),
      webhookController: new WebhookController(this.webhookService),
      healthController: new HealthController(this.database)
    };

    const services = {
      authService: this.authService,
      readingService: this.readingService,
      commerceService: this.commerceService,
      syncService: this.syncService,
      webhookService: this.webhookService
    };

    // 4. Initialize Router
    this.router = new ApiRouter(controllers, services);

    // 5. Create Node.js HTTP Server
    this.httpServer = http.createServer((req, res) => {
      this.router.handle(req, res);
    });

    return this;
  }

  async start() {
    if (!this.httpServer) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.port, this.host, () => {
        resolve({
          port: this.httpServer.address().port,
          host: this.host
        });
      });
      this.httpServer.on('error', reject);
    });
  }

  async stop() {
    return new Promise(resolve => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          this.database.close();
          resolve();
        });
      } else {
        this.database.close();
        resolve();
      }
    });
  }
}
