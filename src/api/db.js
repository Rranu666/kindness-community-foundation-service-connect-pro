/**
 * db.js — Supabase-native data layer
 *
 * Replaces base44Client.js entirely.
 * Import: import { db, auth, invokeLLM, uploadFile } from '@/api/db'
 */
import { supabase } from './supabase';

// ─── TABLE MAP ────────────────────────────────────────────────────
const TABLE = {
  ServiceCategory:    'service_categories',
  ServiceProvider:    'service_providers',
  Service:            'services',
  Order:              'orders',
  Review:             'reviews',
  Notification:       'notifications',
  Wallet:             'wallets',
  Transaction:        'transactions',
  Payout:             'payouts',
  TaxConfig:          'tax_configs',
  Promotion:          'promotions',
  Address:            'addresses',
  Referral:           'referrals',
  ChatMessage:        'chat_messages',
  ChatConversation:   'chat_conversations',
  User:               'user_profiles',
  SubscriptionPlan:   'subscription_plans',
  ProviderSubscription: 'provider_subscriptions',
  Blog:               'blog_posts',
  Favorite:           'favorites',
  Invoice:            'invoices',
  ProviderAvailability: 'provider_availability',
};

// ─── MISSING TABLE GUARD ──────────────────────────────────────────
// Returns true when Supabase says the table doesn't exist yet
const isMissingTable = (error) =>
  error && (error.code === 'PGRST205' || error.code === '42P01' ||
    (error.message && error.message.includes('does not exist')));

// ─── ENTITY FACTORY ───────────────────────────────────────────────
const createEntity = (tableName) => ({
  /** Return all rows */
  list: async () => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) { if (isMissingTable(error)) return []; throw error; }
    return data || [];
  },

  /** Return a single row by id */
  get: async (id) => {
    const { data, error } = await supabase
      .from(tableName).select('*').eq('id', id).single();
    if (error) { if (isMissingTable(error)) return null; throw error; }
    return data;
  },

  /**
   * Filter rows
   * @param {object}  conditions  e.g. { is_active: true }
   * @param {string}  sort        e.g. '-created_date' (leading dash = DESC)
   * @param {number}  limit       max rows
   */
  filter: async (conditions = {}, sort = null, limit = null) => {
    let q = supabase.from(tableName).select('*');
    Object.entries(conditions).forEach(([k, v]) => {
      if (v !== undefined && v !== null) q = q.eq(k, v);
    });
    if (sort) {
      const desc = sort.startsWith('-');
      q = q.order(desc ? sort.slice(1) : sort, { ascending: !desc });
    }
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error) { if (isMissingTable(error)) return []; throw error; }
    return data || [];
  },

  /** Insert a row and return it */
  create: async (data) => {
    const { data: row, error } = await supabase
      .from(tableName).insert(data).select().single();
    if (error) throw error;
    return row;
  },

  /** Update a row by id and return it */
  update: async (id, data) => {
    const { data: row, error } = await supabase
      .from(tableName).update(data).eq('id', id).select().single();
    if (error) { if (isMissingTable(error)) return null; throw error; }
    return row;
  },

  /** Delete a row by id */
  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error && !isMissingTable(error)) throw error;
  },

  /**
   * Subscribe to realtime changes
   * @param {object}   conditions  filter conditions
   * @param {function} callback    called with updated rows
   * @returns {function} unsubscribe function
   */
  subscribe: (conditions = {}, callback) => {
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName },
        async () => {
          // Re-fetch on any change
          let q = supabase.from(tableName).select('*');
          Object.entries(conditions).forEach(([k, v]) => {
            if (v !== undefined && v !== null) q = q.eq(k, v);
          });
          const { data } = await q;
          if (data) callback(data);
        })
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
});

// ─── ENTITY EXPORTS ───────────────────────────────────────────────
export const db = Object.fromEntries(
  Object.entries(TABLE).map(([name, table]) => [name, createEntity(table)])
);

// ─── AUTH ─────────────────────────────────────────────────────────
export const auth = {
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    // Try to enrich with user_profiles
    const { data: profile } = await supabase
      .from('user_profiles').select('*').eq('id', user.id).single();
    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      role: profile?.role || user.user_metadata?.role || 'customer',
      ...user.user_metadata,
      ...(profile || {}),
    };
  },

  logout: async (redirectUrl) => {
    await supabase.auth.signOut();
    window.location.href = redirectUrl || '/';
  },

  redirectToLogin: (fromUrl) => {
    const redirect = fromUrl ? `?redirect=${encodeURIComponent(fromUrl)}` : '';
    window.location.href = `/Login${redirect}`;
  },

  updateMe: async (data) => {
    const { error } = await supabase.auth.updateUser({ data });
    if (error) throw error;
  },
};

// ─── LLM (via Netlify serverless function) ────────────────────────
export const invokeLLM = async ({ prompt, response_json_schema } = {}) => {
  const res = await fetch('/.netlify/functions/invoke-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, response_json_schema }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  return res.json();
};

// ─── FILE UPLOAD (Supabase Storage) ──────────────────────────────
export const uploadFile = async ({ file }) => {
  const ext = file.name.split('.').pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('uploads').upload(path, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(path);
  return { file_url: publicUrl };
};

// ─── SERVERLESS FUNCTION CALLER ──────────────────────────────────
/**
 * Call a Netlify serverless function by name.
 * Functions live at /netlify/functions/<name>.
 */
export const callFunction = async (name, payload = {}) => {
  const res = await fetch(`/.netlify/functions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Function ${name} failed (${res.status}): ${err}`);
  }
  return res.json().catch(() => ({}));
};

// ─── LEGACY COMPAT (no-ops — base44-specific features) ───────────
export const analytics = { track: () => {} };
export const appLogs   = { logUserInApp: async () => {} };
