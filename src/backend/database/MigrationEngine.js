/**
 * Kai RegAI — Database Migration Engine
 * Phase: P13 — Production Backend & Commercial Authority
 * 
 * Versioned, repeatable, and idempotent schema migrations:
 * - Tracks applied migrations in `schema_migrations` table
 * - Runs all pending migrations in transactional sequence
 */

export const MIGRATIONS = [
  {
    version: 1,
    name: '001_initial_production_schema',
    up(db) {
      db.exec(`
        -- 1. Schema Migrations Log
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at TEXT NOT NULL
        );

        -- 2. Users & Identities (Guest + Account)
        CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          owner_type TEXT NOT NULL CHECK(owner_type IN ('GUEST', 'ACCOUNT')),
          email TEXT UNIQUE,
          display_name TEXT,
          metadata TEXT DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

        -- 3. Authenticated Sessions
        CREATE TABLE IF NOT EXISTS sessions (
          session_id TEXT PRIMARY KEY,
          token_hash TEXT NOT NULL UNIQUE,
          user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          expires_at TEXT NOT NULL,
          revoked_at TEXT,
          client_ip TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

        -- 4. Readings (Derived geometric features & canonical reports only, ZERO raw photos)
        CREATE TABLE IF NOT EXISTS readings (
          reading_id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          schema_version TEXT NOT NULL,
          reading_method TEXT NOT NULL,
          report_tier TEXT NOT NULL,
          content_hash TEXT NOT NULL,
          title TEXT,
          summary TEXT,
          feature_snapshot TEXT NOT NULL,
          report_snapshot TEXT NOT NULL,
          metadata TEXT DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_readings_owner_id ON readings(owner_id);
        CREATE INDEX IF NOT EXISTS idx_readings_content_hash ON readings(content_hash);

        -- 5. Financial Transactions
        CREATE TABLE IF NOT EXISTS transactions (
          transaction_id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          provider_transaction_id TEXT,
          product_id TEXT NOT NULL,
          owner_id TEXT NOT NULL REFERENCES users(user_id),
          reading_id TEXT,
          amount REAL NOT NULL,
          currency TEXT NOT NULL,
          status TEXT NOT NULL,
          idempotency_key TEXT UNIQUE,
          metadata TEXT DEFAULT '{}',
          created_at TEXT NOT NULL,
          verified_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_transactions_owner_id ON transactions(owner_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_idempotency_key ON transactions(idempotency_key);

        -- 6. Access Entitlements
        CREATE TABLE IF NOT EXISTS entitlements (
          entitlement_id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL REFERENCES users(user_id),
          reading_id TEXT,
          product_id TEXT NOT NULL,
          tier TEXT NOT NULL,
          features TEXT NOT NULL,
          status TEXT NOT NULL,
          source TEXT NOT NULL,
          transaction_id TEXT REFERENCES transactions(transaction_id),
          granted_at TEXT NOT NULL,
          expires_at TEXT,
          revoked_at TEXT,
          metadata TEXT DEFAULT '{}'
        );
        CREATE INDEX IF NOT EXISTS idx_entitlements_owner_id ON entitlements(owner_id);
        CREATE INDEX IF NOT EXISTS idx_entitlements_reading_id ON entitlements(reading_id);

        -- 7. Payment Webhook Events (Replay Protection)
        CREATE TABLE IF NOT EXISTS webhook_events (
          event_id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          provider_event_id TEXT,
          event_type TEXT NOT NULL,
          idempotency_key TEXT UNIQUE,
          status TEXT NOT NULL,
          raw_payload TEXT NOT NULL,
          received_at TEXT NOT NULL,
          processed_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_webhooks_provider_event ON webhook_events(provider, provider_event_id);

        -- 8. Security & Privacy Audit Events
        CREATE TABLE IF NOT EXISTS audit_events (
          audit_id TEXT PRIMARY KEY,
          event_type TEXT NOT NULL,
          actor_id TEXT,
          resource_id TEXT,
          request_id TEXT,
          details TEXT DEFAULT '{}',
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_audit_events_type ON audit_events(event_type);
        CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_id);
      `);
    }
  },
  {
    version: 2,
    name: '002_astrology_and_consultations',
    up(db) {
      db.exec(`
        -- 9. Astrology Profiles (Birth Data)
        CREATE TABLE IF NOT EXISTS astrology_profiles (
          profile_id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          birth_date TEXT NOT NULL,
          birth_time TEXT,
          is_time_unknown INTEGER NOT NULL DEFAULT 0,
          birth_place TEXT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          timezone TEXT NOT NULL,
          metadata TEXT DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_astrology_profiles_owner ON astrology_profiles(owner_id);

        -- 10. Birth Charts (Canonical snapshot cache)
        CREATE TABLE IF NOT EXISTS birth_charts (
          chart_id TEXT PRIMARY KEY,
          profile_id TEXT REFERENCES astrology_profiles(profile_id) ON DELETE SET NULL,
          owner_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          astrology_system TEXT NOT NULL CHECK(astrology_system IN ('VEDIC', 'WESTERN')),
          input_hash TEXT NOT NULL,
          calculation_version TEXT NOT NULL,
          chart_data TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_birth_charts_owner ON birth_charts(owner_id);
        CREATE INDEX IF NOT EXISTS idx_birth_charts_hash ON birth_charts(input_hash);

        -- 11. Astrologer Consultations
        CREATE TABLE IF NOT EXISTS consultations (
          consultation_id TEXT PRIMARY KEY,
          owner_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
          chart_id TEXT NOT NULL REFERENCES birth_charts(chart_id) ON DELETE CASCADE,
          astrology_system TEXT NOT NULL CHECK(astrology_system IN ('VEDIC', 'WESTERN')),
          topic TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          metadata TEXT DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_consultations_owner ON consultations(owner_id);
        CREATE INDEX IF NOT EXISTS idx_consultations_chart ON consultations(chart_id);

        -- 12. Consultation Messages
        CREATE TABLE IF NOT EXISTS consultation_messages (
          message_id TEXT PRIMARY KEY,
          consultation_id TEXT NOT NULL REFERENCES consultations(consultation_id) ON DELETE CASCADE,
          sender_role TEXT NOT NULL CHECK(sender_role IN ('USER', 'ASTROLOGER', 'SYSTEM')),
          content TEXT NOT NULL,
          structured_payload TEXT,
          prompt_tokens INTEGER,
          completion_tokens INTEGER,
          model_id TEXT,
          idempotency_key TEXT UNIQUE,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_consultation_messages_consultation ON consultation_messages(consultation_id);
        CREATE INDEX IF NOT EXISTS idx_consultation_messages_idempotency ON consultation_messages(idempotency_key);
      `);
    }
  }
];

export class MigrationEngine {
  constructor(database) {
    this.database = database;
  }

  run() {
    const raw = this.database.raw;

    // Ensure migrations log exists
    raw.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);

    const appliedRows = raw.prepare('SELECT version FROM schema_migrations;').all();
    const appliedSet = new Set(appliedRows.map(r => r.version));

    let executedCount = 0;
    for (const migration of MIGRATIONS) {
      if (!appliedSet.has(migration.version)) {
        this.database.transaction((db) => {
          migration.up(db);
          const stmt = db.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);');
          stmt.run(migration.version, migration.name, new Date().toISOString());
        });
        executedCount++;
      }
    }

    return { executedCount, totalMigrations: MIGRATIONS.length };
  }
}
