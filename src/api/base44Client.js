/**
 * Base44 compatibility shim — powered by Supabase + Anthropic Claude
 *
 * All pages use `base44.entities.X`, `base44.auth.*`, and
 * `base44.integrations.Core.*` exactly as before; only the
 * underlying implementation has changed.
 */
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Entity factory — wraps Supabase table CRUD with the original Base44 API
// ---------------------------------------------------------------------------
const createEntity = (tableName) => ({
  list: async () => {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data || [];
  },

  /**
   * @param {object} conditions  e.g. { is_active: true, category_id: 'x' }
   * @param {string} sort        e.g. '-rating' (leading dash = descending)
   * @param {number} limit       max rows to return
   */
  filter: async (conditions = {}, sort = null, limit = null) => {
    let query = supabase.from(tableName).select('*');

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    if (sort) {
      const desc = sort.startsWith('-');
      const col = desc ? sort.slice(1) : sort;
      query = query.order(col, { ascending: !desc });
    }

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  create: async (data) => {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  update: async (id, data) => {
    const { data: result, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
  },
});

// ---------------------------------------------------------------------------
// Auth — wraps Supabase Auth with the original Base44 auth API
// ---------------------------------------------------------------------------
const auth = {
  me: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Not authenticated');
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
      role: user.user_metadata?.role || 'customer',
      ...user.user_metadata,
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

// ---------------------------------------------------------------------------
// Integrations — AI via Netlify function, file upload via Supabase Storage
// ---------------------------------------------------------------------------
const integrations = {
  Core: {
    /**
     * Calls the server-side Netlify function which proxies to Anthropic Claude.
     * The API key is never exposed to the browser.
     */
    InvokeLLM: async ({ prompt, response_json_schema }) => {
      const res = await fetch('/.netlify/functions/invoke-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, response_json_schema }),
      });
      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
      return res.json();
    },

    UploadFile: async ({ file }) => {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(path);
      return { file_url: publicUrl };
    },
  },
};

// ---------------------------------------------------------------------------
// App logs — no-op (Base44-specific analytics not needed)
// ---------------------------------------------------------------------------
const appLogs = {
  logUserInApp: async () => {},
};

// ---------------------------------------------------------------------------
// Export a single `base44` object that preserves the original API surface
// ---------------------------------------------------------------------------
export const base44 = {
  entities: {
    ServiceCategory: createEntity('service_categories'),
    ServiceProvider: createEntity('service_providers'),
    Service: createEntity('services'),
    Order: createEntity('orders'),
    Review: createEntity('reviews'),
    Notification: createEntity('notifications'),
    Wallet: createEntity('wallets'),
    Transaction: createEntity('transactions'),
    Payout: createEntity('payouts'),
    TaxConfig: createEntity('tax_configs'),
    Promotion: createEntity('promotions'),
    Address: createEntity('addresses'),
    Referral: createEntity('referrals'),
    ChatMessage: createEntity('chat_messages'),
    User: createEntity('user_profiles'),
    SubscriptionPlan: createEntity('subscription_plans'),
    ProviderSubscription: createEntity('provider_subscriptions'),
  },
  auth,
  integrations,
  appLogs,
};
