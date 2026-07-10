'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { profitCents, formatBRL } from '@/lib/money';

export default function Leaderboard({ room }) {
  const [players, setPlayers] = useState([]);
  const [by, setBy] = useState('pieces'); // 'pieces' | 'profit'

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.from('players').select('*').eq('room_id', room.id);
      if (active) setPlayers(data || []);
    };
    load();
    const ch = supabase.channel('room-' + room.id)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: 'room_id=eq.' + room.id },
        load)
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [room.id]);

  const ranked = [...players].sort((a, b) =>
    by === 'pieces' ? b.pieces - a.pieces
      : profitCents(b.value_cents, room.rodizio_price) - profitCents(a.value_cents, room.rodizio_price));

  return (
    <div className="bg-zinc-900 rounded p-3">
      <div className="flex gap-2 mb-2 text-sm">
        <button onClick={() => setBy('pieces')} className={by === 'pieces' ? 'font-bold text-orange-500' : ''}>Peças</button>
        <button onClick={() => setBy('profit')} className={by === 'profit' ? 'font-bold text-orange-500' : ''}>Lucro</button>
      </div>
      <ol className="flex flex-col gap-1">
        {ranked.map((p, i) => (
          <li key={p.id} className="flex justify-between">
            <span>{i + 1}. {p.name}</span>
            <span>{by === 'pieces' ? p.pieces + ' pç' : formatBRL(profitCents(p.value_cents, room.rodizio_price))}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
