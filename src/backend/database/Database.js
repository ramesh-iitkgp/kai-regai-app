/**
 * Kai RegAI — Relational Database Layer
 * Phase: P13/P17 — Production Backend & Infrastructure Certification
 * 
 * Powered by native node:sqlite for zero-dependency, high-performance ACID persistence:
 * - Foreign keys enforced
 * - WAL mode enabled for file-backed storage
 * - Transaction wrapper helper for atomic operations
 * - Atomic point-in-time snapshot backup via VACUUM INTO
 * - WAL checkpointing & integrity validation
 */

import { DatabaseSync } from 'node:sqlite';

export class Database {
  constructor(location = ':memory:') {
    this.location = location;
    this.db = null;
  }

  init() {
    if (!this.db) {
      this.db = new DatabaseSync(this.location);
      // Enforce relational constraints
      this.db.exec('PRAGMA foreign_keys = ON;');
      this.db.exec('PRAGMA busy_timeout = 5000;');
      if (this.location !== ':memory:') {
        this.db.exec('PRAGMA journal_mode = WAL;');
        this.db.exec('PRAGMA synchronous = NORMAL;');
      }
    }
    return this.db;
  }

  get raw() {
    if (!this.db) {
      this.init();
    }
    return this.db;
  }

  exec(sql) {
    return this.raw.exec(sql);
  }

  prepare(sql) {
    return this.raw.prepare(sql);
  }

  /**
   * Execute atomic transaction block
   * @param {Function} callback
   */
  transaction(callback) {
    this.raw.exec('BEGIN TRANSACTION;');
    try {
      const result = callback(this.raw);
      this.raw.exec('COMMIT;');
      return result;
    } catch (err) {
      this.raw.exec('ROLLBACK;');
      throw err;
    }
  }

  /**
   * Atomic snapshot backup to target filesystem path via SQLite VACUUM INTO
   * @param {string} targetPath Absolute path to destination .db file
   */
  backup(targetPath) {
    // Escape single quotes for SQL literal
    const escaped = targetPath.replace(/'/g, "''");
    this.raw.exec(`VACUUM INTO '${escaped}';`);
    return { success: true, targetPath };
  }

  /**
   * Execute WAL checkpoint
   * @param {'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE'} mode
   */
  checkpoint(mode = 'TRUNCATE') {
    if (this.location !== ':memory:') {
      return this.raw.prepare(`PRAGMA wal_checkpoint(${mode});`).get();
    }
    return null;
  }

  /**
   * Run full physical and relational integrity checks
   */
  integrityCheck() {
    const integrityRow = this.raw.prepare('PRAGMA integrity_check;').get();
    const fkRows = this.raw.prepare('PRAGMA foreign_key_check;').all();

    const integrityOk = integrityRow && (integrityRow.integrity_check === 'ok' || Object.values(integrityRow)[0] === 'ok');
    const foreignKeysOk = Array.isArray(fkRows) && fkRows.length === 0;

    return {
      ok: Boolean(integrityOk && foreignKeysOk),
      integrity: integrityOk ? 'ok' : 'corrupted',
      foreignKeysOk,
      violations: foreignKeysOk ? [] : fkRows
    };
  }

  close() {
    if (this.db) {
      if (this.location !== ':memory:') {
        try {
          this.checkpoint('TRUNCATE');
        } catch {
          // ignore error on close
        }
      }
      this.db.close();
      this.db = null;
    }
  }
}
