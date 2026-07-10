'use client';
import { useState } from 'react';
import { joinRoom } from '@/lib/rooms';
import { saveSession } from '@/lib/session';

// Shown when someone opens a shared /mesa/<code> link without a session:
// let them pick a nick and join this table directly.
export default function JoinRoomScreen({ room, onJoined }) {
  const [nick, setNick] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { player } = await joinRoom({ code: room.code, name: nick });
      saveSession({ code: room.code, playerId: player.id });
      onJoined(player);
    } catch {
      setErr('Não deu pra entrar. Tenta de novo.');
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-5">
      <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--salmon)' }}>
        🍣 Sushi Battle
      </p>
      <h1 className="mt-3 font-display text-4xl leading-none">Entrar na mesa</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
        {room.name} · <span className="tnum tracking-[0.2em]">{room.code}</span>
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-2.5">
        <input
          required
          autoFocus
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder="Seu apelido"
          className="w-full rounded-lg px-3 py-3 text-[16px] outline-none placeholder:text-[color:var(--muted)]"
          style={{ background: 'var(--slate-2)', color: 'var(--rice)' }}
        />
        {err && <p className="text-sm" style={{ color: 'var(--tuna)' }}>{err}</p>}
        <button
          disabled={busy}
          className="mt-1 rounded-lg py-3 font-semibold disabled:opacity-60"
          style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}
        >
          {busy ? 'Entrando…' : 'Entrar na batalha'}
        </button>
      </form>
    </main>
  );
}
