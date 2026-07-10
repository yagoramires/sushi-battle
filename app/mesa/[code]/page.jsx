'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRoomByCode } from '@/lib/rooms';
import { supabase } from '@/lib/supabase';
import { loadSession } from '@/lib/session';
import RoomView from '@/components/RoomView';
import JoinRoomScreen from '@/components/JoinRoomScreen';

export default function MesaPage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading | join | ready | notfound
  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await getRoomByCode(code);
      if (!r) { setStatus('notfound'); return; }
      if (r.ended_at) { router.replace('/resultado/' + r.code); return; }
      setRoom(r);

      // Already joined on this device? Resume as that player.
      const s = loadSession();
      if (s && s.code === r.code) {
        const { data: p } = await supabase.from('players').select('*').eq('id', s.playerId).maybeSingle();
        if (p) { setPlayer(p); setStatus('ready'); return; }
      }
      // Opened a shared link without a session — let them join with a nick.
      setStatus('join');
    })();
  }, [code]);

  if (status === 'loading') {
    return (
      <main className="grid min-h-[100dvh] place-items-center p-6" style={{ color: 'var(--muted)' }}>
        Carregando…
      </main>
    );
  }

  if (status === 'notfound') {
    return (
      <main className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-6 text-center">
        <div>
          <p className="font-display text-3xl">Mesa não encontrada</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Confere o código ou cria uma nova.</p>
          <Link href="/" className="mt-5 inline-block rounded-lg px-5 py-3 font-semibold" style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}>
            Criar uma mesa
          </Link>
        </div>
      </main>
    );
  }

  if (status === 'join') {
    return (
      <JoinRoomScreen
        room={room}
        onJoined={(p) => { setPlayer(p); setStatus('ready'); }}
      />
    );
  }

  return <RoomView room={room} player={player} />;
}
