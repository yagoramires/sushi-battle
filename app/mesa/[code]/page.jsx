'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRoomByCode } from '@/lib/rooms';
import { supabase } from '@/lib/supabase';
import { loadSession } from '@/lib/session';
import RoomView from '@/components/RoomView';

export default function MesaPage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await getRoomByCode(code);
      if (!r) { router.replace('/'); return; }
      const s = loadSession();
      if (!s || s.code !== r.code) { router.replace('/'); return; } // must join via landing
      const { data: p } = await supabase.from('players').select('*').eq('id', s.playerId).maybeSingle();
      if (!p) { router.replace('/'); return; }
      setRoom(r);
      setPlayer(p);
    })();
  }, [code]);

  if (!room || !player) {
    return (
      <main className="grid min-h-[100dvh] place-items-center p-6" style={{ color: 'var(--muted)' }}>
        Carregando…
      </main>
    );
  }

  return <RoomView room={room} player={player} />;
}
