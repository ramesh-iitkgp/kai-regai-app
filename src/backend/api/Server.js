/**
 * Kai RegAI — HTTP Backend Server
 * Phase: P13/P17 — Production Backend & Infrastructure Certification
 */

import http from 'node:http';
import { Database } from '../database/Database.js';
import { MigrationEngine } from '../database/MigrationEngine.js';
import { CONFIG, validateConfig } from '../config.js';

import { AuditService } from '../services/AuditService.js';
import { AuthService } from '../services/AuthService.js';
import { ReadingService } from '../services/ReadingService.js';
import { CommerceService } from '../services/CommerceService.js';
import { SyncService } from '../services/SyncService.js';
import { WebhookService } from '../services/WebhookService.js';
import { BackupService } from '../services/BackupService.js';

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
    this.port = options.port !== undefined ? options.port : CONFIG.port;
    this.host = options.host || CONFIG.host;
    this.dbPath = options.dbPath || CONFIG.databasePath;
    this.webhookSecret = options.webhookSecret || CONFIG.webhookSecret;
    this.sessionSecret = options.sessionSecret || CONFIG.session.secret;
    this.env = options.env || CONFIG.env;

    this.database = new Database(this.dbPath);
    this.httpServer = null;
    this.inFlightRequests = new Set();
    this.isShuttingDown = false;
  }

  validateStartupConfig() {
    const configToValidate = {
      ...CONFIG,
      env: this.env,
      port: this.port,
      session: {
        ...CONFIG.session,
        secret: this.sessionSecret
      },
      database: { filename: this.dbPath },
      webhookSecret: this.webhookSecret
    };

    const validation = validateConfig(configToValidate);
    if (!validation.valid && (this.env === 'production' || this.env === 'staging')) {
      throw new Error(`Startup rejected due to invalid production configuration:\n${validation.errors.join('\n')}`);
    }
    return validation;
  }

  async init() {
    // 0. Validate Startup Configuration
    this.validateStartupConfig();

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
    this.backupService = new BackupService(this.database);

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

    // 5. Create Node.js HTTP Server with in-flight tracking & timeout
    this.httpServer = http.createServer((req, res) => {
      if (this.isShuttingDown) {
        res.writeHead(503, { 'Content-Type': 'application/json', 'Connection': 'close' });
        res.end(JSON.stringify({ error: 'Service Unavailable: Server is shutting down' }));
        return;
      }

      this.inFlightRequests.add(res);
      res.on('finish', () => this.inFlightRequests.delete(res));
      res.on('close', () => this.inFlightRequests.delete(res));

      this.router.handle(req, res);
    });

    // Enforce 15-second request socket timeout
    this.httpServer.setTimeout(15000);

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

  async stop(graceTimeoutMs = 3000) {
    this.isShuttingDown = true;

    return new Promise(resolve => {
      const finishShutdown = () => {
        try {
          this.database.close();
        } catch {
          // ignore
        }
        resolve();
      };

      if (this.httpServer) {
        // Stop accepting new connections
        this.httpServer.close(() => {
          finishShutdown();
        });

        // Drain in-flight requests or force termination after grace period
        if (this.inFlightRequests.size > 0) {
          const timer = setTimeout(() => {
            for (const res of this.inFlightRequests) {
              try {
                res.destroy();
              } catch {}
            }
            this.inFlightRequests.clear();
          }, graceTimeoutMs);
          if (timer.unref) timer.unref();
        }
      } else {
        finishShutdown();
      }
    });
  }
}
