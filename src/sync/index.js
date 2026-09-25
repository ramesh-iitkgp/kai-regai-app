/**
 * Kai RegAI — Sync Subsystem Barrel Export
 * Phase: P11 — Secure User, Session & Reading History Architecture
 */

import { SyncQueue, SYNC_STATUS } from './SyncQueue.js';
import { RemoteReadingStore } from './RemoteReadingStore.js';
import { SyncEngine } from './SyncEngine.js';
import { defaultStorageProvider } from '../storage/index.js';
import { defaultAuthProvider } from '../auth/index.js';

export {
  SyncQueue,
  SYNC_STATUS,
  RemoteReadingStore,
  SyncEngine
};

export const defaultRemoteReadingStore = new RemoteReadingStore();

export const defaultSyncEngine = new SyncEngine({
  storageProvider: defaultStorageProvider,
  authProvider: defaultAuthProvider,
  remoteStore: defaultRemoteReadingStore
});
