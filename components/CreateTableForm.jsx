'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, joinRoom } from '@/lib/rooms';
import { saveSession } from '@/lib/session';

export default function CreateTableForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [price, setPrice] = useState('');
  const [menu, setMenu] = useState('rodizio');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const room = await createRoom({
        name, menu,
        rodizioPrice: Math.round(parseFloat(price.replace(',', '.')) * 100),
      });
      const { player } = await joinRoom({ code: room.code, name: nick });
      saveSession({ code: room.code, playerId: player.id });
      router.push('/mesa/' + room.code);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 w-full max-w-sm">
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da mesa" className="p-3 rounded bg-zinc-900" />
      <input required value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Seu apelido" className="p-3 rounded bg-zinc-900" />
      <input required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preço do rodízio (ex: 89,90)" className="p-3 rounded bg-zinc-900" />
      <select value={menu} onChange={(e) => setMenu(e.target.value)} className="p-3 rounded bg-zinc-900">
        <option value="rodizio">Rodízio</option>
        <option value="executivo">Rodízio Executivo</option>
      </select>
      <button disabled={busy} className="p-3 rounded bg-orange-600 font-bold">Criar mesa</button>
    </form>
  );
}
