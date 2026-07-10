'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, joinRoom, setRoomHost } from '@/lib/rooms';
import { saveSession } from '@/lib/session';
import { parseBRLToCents } from '@/lib/money';

const field =
  'w-full rounded-lg px-3 py-3 text-[16px] outline-none placeholder:text-[color:var(--muted)]';
const fieldStyle = { background: 'var(--slate-2)', color: 'var(--rice)' };

export default function CreateTableForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [price, setPrice] = useState('');
  const [menu, setMenu] = useState('rodizio');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');

    const rodizioPrice = parseBRLToCents(price);
    if (Number.isNaN(rodizioPrice)) {
      setErr('Digite um preço válido pro rodízio, ex: 89,90');
      return;
    }

    setBusy(true);
    try {
      const room = await createRoom({ name, menu, rodizioPrice });
      const { player } = await joinRoom({ code: room.code, name: nick });
      await setRoomHost(room.id, player.id); // best-effort; won't throw
      saveSession({ code: room.code, playerId: player.id });
      router.push('/mesa/' + room.code);
    } catch {
      setErr('Não deu pra criar a mesa. Confere a conexão e tenta de novo.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2.5">
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da mesa" className={field} style={fieldStyle} />
      <input required value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Seu apelido" className={field} style={fieldStyle} />
      <input required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preço do rodízio (ex: 89,90)" className={field} style={fieldStyle} />
      <select value={menu} onChange={(e) => setMenu(e.target.value)} className={field} style={fieldStyle}>
        <option value="rodizio">Rodízio</option>
        <option value="executivo">Rodízio Executivo</option>
      </select>
      {err && <p className="text-sm" style={{ color: 'var(--tuna)' }}>{err}</p>}
      <button
        disabled={busy}
        className="mt-1 rounded-lg py-3 font-semibold disabled:opacity-60"
        style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}
      >
        {busy ? 'Criando…' : 'Criar mesa'}
      </button>
    </form>
  );
}
