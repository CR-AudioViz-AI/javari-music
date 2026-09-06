import { supabase } from './supabase';
import type { Track, User, Job, CreditTransaction, Brief, TrackType } from './types';

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getOrCreateUser(email: string): Promise<User> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error('Not authenticated');
  }

  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!user) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({ id: authUser.id, email, credits: 100 })
      .select()
      .single();

    if (insertError) throw insertError;
    user = newUser;
  }

  return user;
}

export async function getUserTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getTrack(id: string): Promise<Track | null> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createTrack(
  userId: string,
  brief: Brief,
  type: TrackType,
  provider: string,
  promptHash?: string
): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .insert({
      user_id: userId,
      title: brief.title || `${brief.genre} ${type}`,
      brief,
      duration_sec: brief.durationSec,
      type,
      provider,
      status: 'queued',
      prompt_hash: promptHash,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrack(id: string, updates: Partial<Track>): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createJob(
  trackId: string,
  provider: string,
  payload: any
): Promise<Job> {
  const { data, error } = await supabase
    .from('javari_jobs')
    .insert({
      track_id: trackId,
      provider,
      payload,
      state: 'queued',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job> {
  const { data, error } = await supabase.from('javari_jobs').update(updates).eq('id', id).select().single();

  if (error) throw error;
  return data;
}

export async function getTrackJobs(trackId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('javari_jobs')
    .select('*')
    .eq('track_id', trackId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addCredits(
  userId: string,
  delta: number,
  reason: string,
  meta?: any
): Promise<void> {
  const { error: ledgerError } = await supabase.from('credits_ledger').insert({
    user_id: userId,
    delta,
    reason,
    meta,
  });

  if (ledgerError) throw ledgerError;

  const { error: updateError } = await supabase.rpc('increment_credits', {
    user_id: userId,
    amount: delta,
  });

  if (updateError) {
    const { data: user } = await supabase.from('users').select('credits').eq('id', userId).single();

    if (user) {
      await supabase
        .from('users')
        .update({ credits: user.credits + delta })
        .eq('id', userId);
    }
  }
}

export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  meta?: any
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.credits < amount) {
    return false;
  }

  await addCredits(userId, -amount, reason, meta);
  return true;
}

export async function getCreditHistory(userId: string): Promise<CreditTransaction[]> {
  const { data, error } = await supabase
    .from('credits_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
