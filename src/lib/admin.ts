import { supabase } from './supabase';
import type { Track } from './types';
import { addCredits } from './db';

export interface AdminTrackFilters {
  status?: string;
  provider?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export async function adminListTracks(filters: AdminTrackFilters = {}): Promise<Track[]> {
  let query = supabase.from('tracks').select('*');

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.provider) {
    query = query.eq('provider', filters.provider);
  }

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  query = query.order('created_at', { ascending: false }).limit(100);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function adminRetryTrack(trackId: string): Promise<void> {
  const { error: trackError } = await supabase
    .from('tracks')
    .update({ status: 'queued' })
    .eq('id', trackId);

  if (trackError) throw trackError;

  const { error: jobError } = await supabase
    .from('javari_jobs')
    .update({ state: 'queued', error: null })
    .eq('track_id', trackId);

  if (jobError) throw jobError;
}

export async function adminFailTrack(trackId: string, reason: string): Promise<void> {
  const { error: trackError } = await supabase
    .from('tracks')
    .update({ status: 'error' })
    .eq('id', trackId);

  if (trackError) throw trackError;

  const { error: jobError } = await supabase
    .from('javari_jobs')
    .update({ state: 'failed', error: reason })
    .eq('track_id', trackId);

  if (jobError) throw jobError;
}

export async function adminDisableTrack(trackId: string): Promise<void> {
  const { error } = await supabase
    .from('tracks')
    .update({
      status: 'error',
      preview_url: null,
      full_url: null,
      stems_zip_url: null,
    })
    .eq('id', trackId);

  if (error) throw error;
}

export async function adminAdjustCredits(
  userId: string,
  delta: number,
  reason: string
): Promise<void> {
  await addCredits(userId, delta, reason, { admin: true });
}

export interface AdminStats {
  totalTracks: number;
  tracksByStatus: Record<string, number>;
  tracksByProvider: Record<string, number>;
  totalUsers: number;
  totalCreditsIssued: number;
  recentErrors: Array<{ trackId: string; error: string; timestamp: string }>;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [tracksResult, usersResult, creditsResult, errorsResult] = await Promise.all([
    supabase.from('tracks').select('status, provider'),
    supabase.from('users').select('id'),
    supabase.from('credits_ledger').select('delta').gt('delta', 0),
    supabase
      .from('tracks')
      .select('id, created_at')
      .eq('status', 'error')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const tracks = tracksResult.data || [];
  const users = usersResult.data || [];
  const credits = creditsResult.data || [];
  const errors = errorsResult.data || [];

  const tracksByStatus: Record<string, number> = {};
  const tracksByProvider: Record<string, number> = {};

  tracks.forEach((track) => {
    tracksByStatus[track.status] = (tracksByStatus[track.status] || 0) + 1;
    tracksByProvider[track.provider] = (tracksByProvider[track.provider] || 0) + 1;
  });

  const totalCreditsIssued = credits.reduce((sum, entry) => sum + entry.delta, 0);

  return {
    totalTracks: tracks.length,
    tracksByStatus,
    tracksByProvider,
    totalUsers: users.length,
    totalCreditsIssued,
    recentErrors: errors.map((e) => ({
      trackId: e.id,
      error: 'Error details unavailable',
      timestamp: e.created_at,
    })),
  };
}
