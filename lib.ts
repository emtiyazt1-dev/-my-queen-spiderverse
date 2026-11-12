import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;

const DB = 'mq-spiderverse-v1';
export function loadData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${DB}:${key}`);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
}
export function saveData<T>(key: string, value: T) {
  localStorage.setItem(`${DB}:${key}`, JSON.stringify(value));
}

// All app content is stored as owner-scoped JSON rows protected by RLS.
export async function loadCloudData(): Promise<Record<string, any>> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('app_state').select('state_key,state_value');
  if (error) throw error;
  return Object.fromEntries((data || []).map((row: any) => [row.state_key, row.state_value]));
}

export async function saveCloudData(key: string, value: unknown): Promise<void> {
  if (!supabase) return;
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error('Your session has expired. Please sign in again.');
  const { error } = await supabase.from('app_state').upsert({
    user_id: user.id, state_key: key, state_value: value, updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,state_key' });
  if (error) throw error;
  saveData(key, value);
}

export async function storeImage(file: File): Promise<string> {
  if (!supabase) throw new Error('Cloud storage is not configured.');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError || new Error('Please sign in again.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80) || 'photo.jpg';
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('queen-private').upload(path, file, {
    cacheControl: '3600', upsert: false, contentType: file.type
  });
  if (error) throw error;
  return path;
}

export async function getPrivateImageUrl(path: string): Promise<string> {
  if (!supabase) return '';
  const { data, error } = await supabase.storage.from('queen-private').createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deletePrivateImage(path: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.storage.from('queen-private').remove([path]);
  if (error) throw error;
}
