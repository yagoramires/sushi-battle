'use client';
import { useRef, useState } from 'react';
import menu from '@/menu.json';
import { applyDelta, pushPlayer } from '@/lib/consume';
import { profitCents, formatBRL } from '@/lib/money';
import Counter from './Counter';
import Leaderboard from './Leaderboard';

export default function RoomView({ room, player }) {
  const items = menu[room.menu];

  const initial = {
    pieces: player.pieces,
    value_cents: player.value_cents,
    counts: player.counts || {},
  };
  const [me, setMe] = useState(initial);
  const latest = useRef(initial);
  const pushTimer = useRef(null);

  const [tab, setTab] = useState('placar');
  const [copied, setCopied] = useState('');

  function change(item, delta) {
    const next = applyDelta(latest.current, item, delta);
    latest.current = next;
    setMe(next); // optimistic, instant
    // Debounce the write: each push replaces the whole row, so rapid taps must
    // not fire concurrent full-row updates (out-of-order arrival would drop
    // pieces). Coalesce to one push of the final snapshot.
    // ponytail: 150ms trailing debounce; pushes >150ms apart can still race in
    // theory, but that's not fast-tapping — a serial queue if it ever matters.
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => pushPlayer(player.id, latest.current), 150);
  }

  function flash(kind) {
    setCopied(kind);
    setTimeout(() => setCopied(''), 1600);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false; // blocked / insecure context — code is on screen to read
    }
  }

  async function copyCode() {
    if (await copyToClipboard(room.code)) flash('code');
  }

  async function share() {
    const url = window.location.href;
    const text = `Entra na minha mesa no Sushi Battle: ${room.name} — código ${room.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Sushi Battle', text, url });
      } catch {
        // user dismissed the share sheet — nothing to do
      }
      return;
    }
    if (await copyToClipboard(url)) flash('link');
  }

  const profit = profitCents(me.value_cents, room.rodizio_price);
  const winning = profit >= 0;
  // break-even meter: how much of the rodízio you've "eaten back"
  const pct = Math.min(100, Math.round((me.value_cents / room.rodizio_price) * 100));

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-20 border-b px-4 pb-3 pt-4"
        style={{ background: 'var(--nori)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight">{room.name}</h1>
            <button
              onClick={copyCode}
              className="mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium tnum"
              style={{ background: 'var(--slate-2)', color: 'var(--muted)' }}
            >
              <span className="tracking-[0.2em]">{room.code}</span>
              <span aria-hidden>{copied === 'code' ? '✓' : '⧉'}</span>
            </button>
          </div>
          <button
            onClick={share}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold"
            style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}
          >
            {copied === 'link' ? 'Copiado!' : 'Convidar'}
          </button>
        </div>

        {/* You vs. the restaurant — the signature strip */}
        <div
          className="mt-3 rounded-xl border p-3"
          style={{ background: 'var(--slate)', borderColor: 'var(--line)' }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Suas peças
              </p>
              <p className="font-display text-4xl leading-none">{me.pieces}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                {winning ? 'Você tá lucrando' : 'Falta pro empate'}
              </p>
              <p
                className="font-display text-4xl leading-none tnum"
                style={{ color: winning ? 'var(--wasabi)' : 'var(--tuna)' }}
              >
                {winning ? '+' : ''}{formatBRL(profit)}
              </p>
            </div>
          </div>
          {/* break-even meter */}
          <div
            className="mt-3 h-2 overflow-hidden rounded-full"
            style={{ background: 'var(--slate-2)' }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso até empatar com o rodízio"
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${pct}%`, background: winning ? 'var(--wasabi)' : 'var(--salmon)' }}
            />
          </div>
          <p className="mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>
            {winning
              ? `Comeu R$ ${(me.value_cents / 100).toFixed(2).replace('.', ',')} de ${formatBRL(room.rodizio_price)}`
              : `${pct}% do rodízio (${formatBRL(room.rodizio_price)})`}
          </p>
        </div>

        {/* Tabs */}
        <div
          className="mt-3 grid grid-cols-2 gap-1 rounded-xl p-1"
          style={{ background: 'var(--slate-2)' }}
          role="tablist"
        >
          {[
            ['placar', 'Placar'],
            ['contar', 'Contar'],
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className="rounded-lg py-2 text-sm font-semibold transition-colors"
              style={
                tab === key
                  ? { background: 'var(--salmon)', color: 'var(--salmon-ink)' }
                  : { color: 'var(--muted)' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 px-4 py-4">
        {tab === 'placar' ? (
          <Leaderboard room={room} meId={player.id} />
        ) : (
          <Counter items={items} counts={me.counts} onChange={change} />
        )}
      </main>
    </div>
  );
}
