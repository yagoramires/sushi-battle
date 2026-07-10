'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinRoom } from '@/lib/rooms';
import { saveSession } from '@/lib/session';

const field =
  'w-full rounded-lg px-3 py-3 text-[16px] outline-none placeholder:text-[color:var(--muted)]';
const fieldStyle = { background: 'var(--slate-2)', color: 'var(--rice)' };

export default function JoinTableForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [nick, setNick] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { room, player } = await joinRoom({ code: code.trim().toUpperCase(), name: nick });
      saveSession({ code: room.code, playerId: player.id });
      router.push('/mesa/' + room.code);
    } catch (e) {
      setErr(e.message === 'sala não encontrada' ? 'Não achei essa mesa. Confere o código.' : 'Não deu pra entrar. Tenta de novo.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2.5">
      <input
        required
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Código da mesa"
        maxLength={6}
        className={`${field} uppercase tracking-[0.25em]`}
        style={fieldStyle}
      />
      <input required value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Seu apelido" className={field} style={fieldStyle} />
      {err && <p className="text-sm" style={{ color: 'var(--tuna)' }}>{err}</p>}
      <button
        disabled={busy}
        className="mt-1 rounded-lg border py-3 font-semibold disabled:opacity-60"
        style={{ borderColor: 'var(--line)', color: 'var(--rice)' }}
      >
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
