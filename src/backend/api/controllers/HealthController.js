/**
 * Kai RegAI — Health Controller
 * Phase: P13/P17 — Production Backend & Infrastructure Certification
 * 
 * Provides production-grade health, liveness, and readiness probes:
 * - /health & /api/v1/health: Full dependency & resource inspection
 * - /health/live: Orchestration liveness probe (K8s/ECS/systemd)
 * - /health/ready: Ingress readiness probe for traffic routing
 */

export class HealthController {
  constructor(database) {
    this.database = database;
    this.startTime = Date.now();
  }

  getHealth(req, res) {
    let dbStatus = 'UP';
    let migrationCount = 0;

    try {
      this.database.prepare('SELECT 1;').get();
      const rows = this.database.prepare('SELECT count(*) as cnt FROM schema_migrations;').get();
      migrationCount = rows ? rows.cnt : 0;
    } catch (e) {
      dbStatus = 'DOWN';
    }

    const mem = process.memoryUsage();
    const healthy = dbStatus === 'UP';
    const status = healthy ? 200 : 503;

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: healthy ? 'HEALTHY' : 'DEGRADED',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      components: {
        database: dbStatus,
        api: 'UP',
        migrations: migrationCount > 0 ? 'CURRENT' : 'PENDING'
      },
      resources: {
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024) * 100) / 100,
        rssMb: Math.round(mem.rss / (1024 * 1024) * 100) / 100
      }
    }));
  }

  getLiveness(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ALIVE',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
    }));
  }

  getReadiness(req, res) {
    let ready = false;
    try {
      const ping = this.database.prepare('SELECT 1;').get();
      ready = !!ping;
    } catch {
      ready = false;
    }

    const statusCode = ready ? 200 : 503;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: ready ? 'READY' : 'NOT_READY'
    }));
  }
}
