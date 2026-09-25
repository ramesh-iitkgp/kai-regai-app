/**
 * Kai RegAI — Storage Subsystem Barrel Export
 * Phase: P11 — Secure User, Session & Reading History Architecture
 */

import { StorageProvider } from './StorageProvider.js';
import { MemoryStorageProvider } from './MemoryStorageProvider.js';
import { IndexedDBStorageProvider } from './IndexedDBStorageProvider.js';
import { StorageSerializer } from './StorageSerializer.js';
import { ReadingRecord, READING_STATUS, OWNER_TYPE } from './ReadingSchema.js';
import { ReadingSchemaValidator } from './ReadingSchemaValidator.js';
import { ReadingMigrationEngine } from './ReadingMigrationEngine.js';

export {
  StorageProvider,
  MemoryStorageProvider,
  IndexedDBStorageProvider,
  StorageSerializer,
  ReadingRecord,
  READING_STATUS,
  OWNER_TYPE,
  ReadingSchemaValidator,
  ReadingMigrationEngine
};

// Singleton storage provider instance
export const defaultStorageProvider = new IndexedDBStorageProvider();
