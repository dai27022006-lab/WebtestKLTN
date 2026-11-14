import { isSupabaseConfigured } from '@/lib/db/env';

import { InMemoryDevStore } from './dev-store';
import { SupabaseDataStore } from './supabase-store';
import type { DataStore } from './types';

let cachedDevStore: InMemoryDevStore | null = null;
let cachedSupabaseStore: SupabaseDataStore | null = null;

export function getStore(): DataStore {
  if (isSupabaseConfigured()) {
    if (!cachedSupabaseStore) {
      cachedSupabaseStore = new SupabaseDataStore();
    }
    return cachedSupabaseStore;
  }

  if (!cachedDevStore) {
    cachedDevStore = new InMemoryDevStore();
  }
  return cachedDevStore;
}

export * from './types';
