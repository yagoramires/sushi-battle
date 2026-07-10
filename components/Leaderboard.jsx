'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { profitCents, formatBRL } from '@/lib/money';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ room, meId }) {
  const [players, setPlayers] = useState([]);
  const [by, setBy] = useState('pieces'); // 'pieces' | 'profit'

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.from('players').select('*').eq('room_id', room.id);
      if (active) setPlayers(data || []);
    };
    load();
    const ch = supabase
      .channel('room-' + room.id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: 'room_id=eq.' + room.id },
        load
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [room.id]);

  const ranked = [...players].sort((a, b) =>
    by === 'pieces'
      ? b.pieces - a.pieces
      : profitCents(b.value_cents, room.rodizio_price) - profitCents(a.value_cents, room.rodizio_price)
  );

  return (
    <div>
      {/* Peças / Lucro segmented toggle */}
      <div
        className="mb-3 inline-grid grid-cols-2 gap-1 rounded-lg p-1 text-sm"
        style={{ background: 'var(--slate-2)' }}
      >
        {[
          ['pieces', 'Peças'],
          ['profit', 'Lucro'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setBy(key)}
            className="rounded-md px-4 py-1.5 font-semibold transition-colors"
            style={by === key ? { background: 'var(--salmon)', color: 'var(--salmon-ink)' } : { color: 'var(--muted)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {ranked.length === 0 ? (
        <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
          Ninguém comeu ainda. Vai lá na aba Contar e abre o placar.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {ranked.map((p, i) => {
            const isMe = p.id === meId;
            const profit = profitCents(p.value_cents, room.rodizio_price);
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{
                  background: isMe ? 'var(--slate)' : 'transparent',
                  borderColor: isMe ? 'var(--salmon)' : 'var(--line)',
                }}
              >
                <span className="w-7 shrink-0 text-center font-display text-lg tnum" style={{ color: 'var(--muted)' }}>
                  {MEDAL[i] || i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {p.name}
                  {isMe && (
                    <span className="ml-1.5 text-xs font-normal" style={{ color: 'var(--salmon)' }}>
                      você
                    </span>
                  )}
                </span>
                {by === 'pieces' ? (
                  <span className="font-display text-2xl leading-none tnum">
                    {p.pieces}
                    <span className="ml-1 align-baseline text-xs" style={{ color: 'var(--muted)' }}>
                      pç
                    </span>
                  </span>
                ) : (
                  <span
                    className="font-display text-xl leading-none tnum"
                    style={{ color: profit >= 0 ? 'var(--wasabi)' : 'var(--tuna)' }}
                  >
                    {profit >= 0 ? '+' : ''}
                    {formatBRL(profit)}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
