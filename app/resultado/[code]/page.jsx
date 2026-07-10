'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRoomByCode } from '@/lib/rooms';
import { supabase } from '@/lib/supabase';
import ResultView from '@/components/ResultView';

export default function ResultadoPage({ params }) {
  const { code } = use(params);
  const router = useRouter();
  const [state, setState] = useState({ status: 'loading', room: null, players: [] });

  useEffect(() => {
    (async () => {
      const room = await getRoomByCode(code);
      if (!room) {
        setState({ status: 'notfound', room: null, players: [] });
        return;
      }
      const { data } = await supabase.from('players').select('*').eq('room_id', room.id);
      setState({ status: 'ready', room, players: data || [] });
    })();
  }, [code]);

  if (state.status === 'loading') {
    return (
      <main className="grid min-h-[100dvh] place-items-center p-6" style={{ color: 'var(--muted)' }}>
        Carregando resultado…
      </main>
    );
  }

  if (state.status === 'notfound') {
    return (
      <main className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-6 text-center">
        <div>
          <p className="font-display text-3xl">Mesa não encontrada</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Esse código não existe mais.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-5 rounded-lg px-5 py-3 font-semibold"
            style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}
          >
            Criar uma mesa
          </button>
        </div>
      </main>
    );
  }

  return <ResultView room={state.room} players={state.players} />;
}
