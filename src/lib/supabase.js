import { createClient } from '@supabase/supabase-js';

// Read default credentials from environment or localStorage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem('tms_supabase_url') || '';
  const localKey = localStorage.getItem('tms_supabase_key') || '';

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  return { url, key, isConfigured: Boolean(url && key && url.startsWith('http')) };
};

const config = getSupabaseConfig();

export const supabase = config.isConfigured 
  ? createClient(config.url, config.key) 
  : null;

export const updateSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem('tms_supabase_url', url);
  else localStorage.removeItem('tms_supabase_url');

  if (key) localStorage.setItem('tms_supabase_key', key);
  else localStorage.removeItem('tms_supabase_key');

  window.location.reload();
};
