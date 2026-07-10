import { supabase } from './supabase.js';

export function applyDelta(player, item, delta) {
  const curr = player.counts?.[item.id] || 0;
  const next = Math.max(0, curr + delta);
  const applied = next - curr; // 0 when trying to go below zero
  return {
    pieces: Math.max(0, player.pieces + applied),
    value_cents: Math.max(0, player.value_cents + applied * item.valueCents),
    counts: { ...player.counts, [item.id]: next },
  };
}

export const pushPlayer = async (playerId, next) => {
  // supabase-js query builders are lazy thenables: the request only fires
  // once `.then()`/await is invoked on them. Awaiting here (while callers
  // still don't await this function) keeps the call fire-and-forget from
  // the caller's perspective while guaranteeing the upsert actually goes out.
  await supabase.from('players').update(next).eq('id', playerId);
};
