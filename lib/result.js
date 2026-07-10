import { cache } from 'react';

// Server-side read of a finished table for the public result page + its OG
// preview. Uses the REST endpoint with the anon key (permissive RLS) so we
// don't drag the browser Supabase client onto the server. Wrapped in React
// cache() so the page render and generateMetadata share a single fetch per request.
export const getResult = cache(async (code) => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) return null;

  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const rooms = await fetch(
    `${base}/rest/v1/rooms?code=ilike.${encodeURIComponent(code)}&select=*`,
    { headers, cache: 'no-store' }
  ).then((r) => (r.ok ? r.json() : []));

  const room = rooms?.[0];
  if (!room) return null;

  const players = await fetch(
    `${base}/rest/v1/players?room_id=eq.${room.id}&select=*`,
    { headers, cache: 'no-store' }
  ).then((r) => (r.ok ? r.json() : []));

  return { room, players: players || [] };
});
