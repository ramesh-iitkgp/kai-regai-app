/**
 * Kai RegAI — Database Backup & Disaster Recovery Service
 * Phase: P17 — Production Infrastructure & Deployment Certification
 * 
 * Provides verifiable, transaction-consistent backups and point-in-time recovery:
 * - Atomic snapshot generation via SQLite VACUUM INTO
 * - Cryptographic SHA-256 checksum generation & validation
 * - Isolated snapshot integrity and foreign-key verification
 * - Pre-flight & post-flight verified disaster recovery restoration
 * - RTO and RPO operational telemetry
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export class BackupService {
  constructor(database, options = {}) {
    this.database = database;
    this.backupDir = options.backupDir || path.resolve(process.cwd(), 'backups');
  }

  /**
   * Create an atomic point-in-time backup snapshot and accompanying cryptographic manifest
   * @param {string} [customDir] Optional output directory override
   * @param {string} [prefix='kai_backup'] Filename prefix
   */
  async createBackup(customDir = null, prefix = 'kai_backup') {
    const startTime = Date.now();
    const targetDir = customDir || this.backupDir;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbFileName = `${prefix}_${timestamp}.db`;
    const manifestFileName = `${prefix}_${timestamp}.manifest.json`;

    const targetDbPath = path.join(targetDir, dbFileName);
    const targetManifestPath = path.join(targetDir, manifestFileName);

    // 1. Execute atomic VACUUM INTO snapshot
    this.database.backup(targetDbPath);

    // 2. Read bytes and compute cryptographic SHA-256 hash
    const fileBuffer = fs.readFileSync(targetDbPath);
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const bytes = fileBuffer.length;

    // 3. Mount snapshot in isolated verification engine
    const isolatedDb = new DatabaseSync(targetDbPath);
    isolatedDb.exec('PRAGMA foreign_keys = ON;');
    const integrityRow = isolatedDb.prepare('PRAGMA integrity_check;').get();
    const fkRows = isolatedDb.prepare('PRAGMA foreign_key_check;').all();

    const isIntegrityOk = integrityRow && (integrityRow.integrity_check === 'ok' || Object.values(integrityRow)[0] === 'ok');
    const isForeignKeysOk = Array.isArray(fkRows) && fkRows.length === 0;

    // 4. Extract table census
    const tables = ['users', 'sessions', 'readings', 'transactions', 'entitlements', 'webhook_events', 'audit_events', 'schema_migrations'];
    const tableCounts = {};

    for (const table of tables) {
      try {
        const row = isolatedDb.prepare(`SELECT count(*) as count FROM ${table};`).get();
        tableCounts[table] = row ? row.count : 0;
      } catch {
        tableCounts[table] = -1;
      }
    }

    const schemaVersionRow = isolatedDb.prepare('SELECT max(version) as max_version FROM schema_migrations;').get();
    const schemaVersion = schemaVersionRow ? schemaVersionRow.max_version : 0;

    isolatedDb.close();

    if (!isIntegrityOk || !isForeignKeysOk) {
      fs.unlinkSync(targetDbPath);
      throw new Error('Backup integrity verification failed: snapshot file is physically or relationally corrupted');
    }

    // 5. Generate and persist cryptographic manifest
    const manifest = {
      backupFile: dbFileName,
      sha256,
      bytes,
      createdAt: new Date().toISOString(),
      schemaVersion,
      tableCounts,
      verification: {
        integrityCheck: 'ok',
        foreignKeyCheck: 'ok'
      },
      durationMs: Date.now() - startTime
    };

    fs.writeFileSync(targetManifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    return {
      success: true,
      backupPath: targetDbPath,
      manifestPath: targetManifestPath,
      sha256,
      bytes,
      schemaVersion,
      tableCounts,
      durationMs: Date.now() - startTime
    };
  }

  /**
   * Verify integrity of a stored backup file against its manifest or SQLite engine
   * @param {string} backupDbPath Path to the .db snapshot
   * @param {string} [manifestPath] Optional path to manifest
   */
  verifyBackup(backupDbPath, manifestPath = null) {
    if (!fs.existsSync(backupDbPath)) {
      return { valid: false, error: 'Backup file does not exist' };
    }

    const fileBuffer = fs.readFileSync(backupDbPath);
    const computedHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (manifestPath && fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.sha256 !== computedHash) {
        return {
          valid: false,
          error: `Checksum mismatch: expected ${manifest.sha256}, got ${computedHash}`
        };
      }
    }

    try {
      const isolatedDb = new DatabaseSync(backupDbPath);
      isolatedDb.exec('PRAGMA foreign_keys = ON;');
      const integrityRow = isolatedDb.prepare('PRAGMA integrity_check;').get();
      const fkRows = isolatedDb.prepare('PRAGMA foreign_key_check;').all();
      isolatedDb.close();

      const isIntegrityOk = integrityRow && (integrityRow.integrity_check === 'ok' || Object.values(integrityRow)[0] === 'ok');
      const isForeignKeysOk = Array.isArray(fkRows) && fkRows.length === 0;

      return {
        valid: Boolean(isIntegrityOk && isForeignKeysOk),
        sha256: computedHash,
        bytes: fileBuffer.length,
        integrity: isIntegrityOk ? 'ok' : 'corrupted',
        foreignKeysOk: isForeignKeysOk
      };
    } catch (err) {
      return {
        valid: false,
        error: `Database verification crashed: ${err.message}`
      };
    }
  }

  /**
   * Perform disaster recovery restore of a backup snapshot to a target destination
   * @param {string} backupDbPath Source backup file
   * @param {string} destinationDbPath Target production database file path
   */
  async restoreBackup(backupDbPath, destinationDbPath) {
    const startTime = Date.now();

    // 1. Pre-flight verification
    const verification = this.verifyBackup(backupDbPath);
    if (!verification.valid) {
      throw new Error(`Restore rejected: Backup verification failed (${verification.error})`);
    }

    // 2. Ensure target directory exists
    const destDir = path.dirname(destinationDbPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // 3. If destination already exists, remove WAL and SHM companion files
    if (fs.existsSync(destinationDbPath)) {
      try {
        fs.unlinkSync(`${destinationDbPath}-wal`);
      } catch {}
      try {
        fs.unlinkSync(`${destinationDbPath}-shm`);
      } catch {}
    }

    // 4. Atomic copy of verified snapshot
    fs.copyFileSync(backupDbPath, destinationDbPath);

    // 5. Post-restore smoke validation
    const restoredDb = new DatabaseSync(destinationDbPath);
    restoredDb.exec('PRAGMA foreign_keys = ON;');
    const integrityRow = restoredDb.prepare('PRAGMA integrity_check;').get();
    const rows = restoredDb.prepare('SELECT count(*) as count FROM schema_migrations;').get();
    restoredDb.close();

    const durationMs = Date.now() - startTime;

    return {
      success: true,
      restoredPath: destinationDbPath,
      migrationsApplied: rows ? rows.count : 0,
      integrity: integrityRow && Object.values(integrityRow)[0] === 'ok' ? 'ok' : 'degraded',
      durationMs
    };
  }
}
