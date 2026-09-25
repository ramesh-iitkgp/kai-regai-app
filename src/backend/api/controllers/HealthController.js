/**
 * Kai RegAI — Health Controller
 * Phase: P13 — Production Backend & Commercial Authority
 */

export class HealthController {
  constructor(database) {
    this.database = database;
    this.startTime = Date.now();
  }

  getHealth(req, res) {
    let dbStatus = 'UP';
    try {
      this.database.prepare('SELECT 1;').get();
    } catch (e) {
      dbStatus = 'DOWN';
    }

    const healthy = dbStatus === 'UP';
    const status = healthy ? 200 : 503;

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: healthy ? 'HEALTHY' : 'DEGRADED',
      version: '1.0.0',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      components: {
        database: dbStatus,
        api: 'UP'
      }
    }));
  }
}
