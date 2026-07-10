'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRoomByCode } from '@/lib/rooms';
import { supabase } from '@/lib/supabase';
import { loadSession } from '@/lib/session';
import Counter from '@/components/Counter';
import Leaderboard from '@/components/Leaderboard';

export default function MesaPage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await getRoomByCode(code);
      if (!r) { router.replace('/'); return; }
      setRoom(r);
      const s = loadSession();
      if (!s || s.code !== r.code) { router.replace('/'); return; } // must join via landing
      const { data: p } = await supabase.from('players').select('*').eq('id', s.playerId).maybeSingle();
      if (!p) { router.replace('/'); return; }
      setPlayer(p);
    })();
  }, [code]);

  if (!room || !player) return <main className="p-6">Carregando…</main>;

  return (
    <main className="max-w-md mx-auto p-4 flex flex-col gap-4">
      <header className="text-center">
        <h1 className="font-bold">{room.name}</h1>
        <p className="text-xs text-zinc-400">Código: {room.code}</p>
      </header>
      <Leaderboard room={room} />
      <Counter room={room} player={player} />
    </main>
  );
}
