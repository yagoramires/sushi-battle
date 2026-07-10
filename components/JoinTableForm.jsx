'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinRoom } from '@/lib/rooms';
import { saveSession } from '@/lib/session';

export default function JoinTableForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [nick, setNick] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { room, player } = await joinRoom({ code: code.trim().toUpperCase(), name: nick });
      saveSession({ code: room.code, playerId: player.id });
      router.push('/mesa/' + room.code);
    } catch (e) { setErr(e.message); }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 w-full max-w-sm">
      <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código da mesa" className="p-3 rounded bg-zinc-900 uppercase" />
      <input required value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Seu apelido" className="p-3 rounded bg-zinc-900" />
      {err && <p className="text-red-500 text-sm">{err}</p>}
      <button className="p-3 rounded bg-zinc-700 font-bold">Entrar</button>
    </form>
  );
}
