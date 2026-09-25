/**
 * Kai RegAI — Auth Subsystem Barrel Export
 * Phase: P11 — Secure User, Session & Reading History Architecture
 */

import { AuthProvider } from './AuthProvider.js';
import { UserProfile } from './UserProfile.js';
import { GuestIdentityProvider } from './GuestIdentityProvider.js';
import { MockAuthProvider } from './MockAuthProvider.js';
import { defaultStorageProvider } from '../storage/index.js';

export {
  AuthProvider,
  UserProfile,
  GuestIdentityProvider,
  MockAuthProvider
};

// Singleton Auth Provider instance
export const defaultAuthProvider = new MockAuthProvider(defaultStorageProvider);
