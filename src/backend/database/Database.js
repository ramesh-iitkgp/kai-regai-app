/**
 * Kai RegAI — Relational Database Layer
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Powered by native node:sqlite for zero-dependency, high-performance ACID persistence:
 * - Foreign keys enforced
 * - WAL mode enabled for file-backed storage
 * - Transaction wrapper helper for atomic operations
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
      if (this.location !== ':memory:') {
        this.db.exec('PRAGMA journal_mode = WAL;');
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

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
