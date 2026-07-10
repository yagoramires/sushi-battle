'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { profitCents, formatBRL } from '@/lib/money';

const MEDAL = ['🥇', '🥈', '🥉'];

// Count a number up from 0 on mount (skipped under reduced motion).
function useCountUp(target, ms = 900) {
  const [n, setN] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setN(target);
      return;
    }
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);
  return n;
}

export default function ResultView({ room, players }) {
  const router = useRouter();
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShown(true), 40);
    return () => clearTimeout(id);
  }, []);

  const byPieces = useMemo(
    () => [...players].sort((a, b) => b.pieces - a.pieces),
    [players]
  );
  const champ = byPieces[0];
  const champPieces = useCountUp(champ ? champ.pieces : 0);

  const stats = useMemo(() => {
    const withProfit = players.map((p) => ({ ...p, profit: profitCents(p.value_cents, room.rodizio_price) }));
    const tablePieces = withProfit.reduce((s, p) => s + p.pieces, 0);
    const tableProfit = withProfit.reduce((s, p) => s + p.profit, 0);
    const topProfit = withProfit.reduce((a, b) => (b.profit > a.profit ? b : a), withProfit[0]);
    const worstProfit = withProfit.reduce((a, b) => (b.profit < a.profit ? b : a), withProfit[0]);
    return { tablePieces, tableProfit, topProfit, worstProfit };
  }, [players, room.rodizio_price]);

  const tableWon = stats.tableProfit >= 0;

  // podium visual order: 2nd, 1st, 3rd — heights by rank
  const podium = [byPieces[1], byPieces[0], byPieces[2]].filter(Boolean);
  const barH = (id) => (id === byPieces[0]?.id ? 152 : id === byPieces[1]?.id ? 116 : 92);

  async function share() {
    const url = window.location.href;
    const text = champ
      ? `${champ.name} foi o campeão da ${room.name} no Sushi Battle com ${champ.pieces} peças! 🍣`
      : `Resultado da ${room.name} no Sushi Battle 🍣`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Sushi Battle', text, url }); } catch {}
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-10">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--salmon)' }}>
          Fim de rodízio
        </p>
        <h1 className="mt-1 text-xl font-semibold">{room.name}</h1>
      </header>

      {/* Verdict stamp — the signature */}
      <div className="mt-6 flex justify-center">
        <div
          className="rotate-[-5deg] rounded-lg border-2 px-4 py-2 text-center transition-all duration-500"
          style={{
            borderColor: tableWon ? 'var(--wasabi)' : 'var(--tuna)',
            color: tableWon ? 'var(--wasabi)' : 'var(--tuna)',
            opacity: shown ? 1 : 0,
            transform: shown ? 'rotate(-5deg) scale(1)' : 'rotate(-5deg) scale(1.25)',
          }}
        >
          <p className="font-display text-2xl leading-none">
            {tableWon ? 'A mesa venceu' : 'O restaurante levou'}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider">
            {tableWon ? `+${formatBRL(stats.tableProfit)} contra a casa` : `${formatBRL(stats.tableProfit)} pra casa`}
          </p>
        </div>
      </div>

      {/* Champion */}
      {champ && (
        <div className="mt-7 text-center">
          <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            Campeão da mesa
          </p>
          <p className="mt-1 text-2xl font-semibold">🏆 {champ.name}</p>
          <p className="font-display text-6xl leading-none tnum" style={{ color: 'var(--salmon)' }}>
            {champPieces}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>peças</p>
        </div>
      )}

      {/* Podium */}
      <div className="mt-6 flex items-end justify-center gap-2">
        {podium.map((p) => {
          const rank = byPieces.findIndex((x) => x.id === p.id);
          const isChamp = rank === 0;
          return (
            <div key={p.id} className="flex w-1/3 flex-col items-center">
              <span className="text-2xl">{MEDAL[rank]}</span>
              <span className="mb-1 max-w-full truncate text-xs font-medium">{p.name}</span>
              <div
                className="flex w-full items-start justify-center rounded-t-lg pt-2 transition-[height] duration-700 ease-out"
                style={{
                  height: shown ? barH(p.id) : 0,
                  background: isChamp ? 'var(--salmon)' : 'var(--slate-2)',
                  color: isChamp ? 'var(--salmon-ink)' : 'var(--rice)',
                }}
              >
                <span className="font-display text-2xl leading-none tnum">{p.pieces}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Superlatives */}
      <div className="mt-7 grid grid-cols-2 gap-2">
        <Badge emoji="💸" label="Mais lucrou" value={stats.topProfit?.name} sub={stats.topProfit ? `${stats.topProfit.profit >= 0 ? '+' : ''}${formatBRL(stats.topProfit.profit)}` : ''} tone={stats.topProfit?.profit >= 0 ? 'good' : 'bad'} />
        <Badge emoji="🩹" label="Pagou o mico" value={stats.worstProfit?.name} sub={stats.worstProfit ? formatBRL(stats.worstProfit.profit) : ''} tone="bad" />
        <Badge emoji="🍣" label="Peças da mesa" value={String(stats.tablePieces)} sub="no total" />
        <Badge emoji="👥" label="Jogadores" value={String(players.length)} sub="na batalha" />
      </div>

      {/* Full ranking */}
      <div className="mt-7">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          Ranking completo
        </h2>
        <ol className="flex flex-col gap-1.5">
          {byPieces.map((p, i) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
              style={{ borderColor: 'var(--line)' }}
            >
              <span className="w-6 text-center font-display tnum" style={{ color: 'var(--muted)' }}>
                {MEDAL[i] || i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
              <span
                className="text-xs tnum"
                style={{ color: profitCents(p.value_cents, room.rodizio_price) >= 0 ? 'var(--wasabi)' : 'var(--tuna)' }}
              >
                {formatBRL(profitCents(p.value_cents, room.rodizio_price))}
              </span>
              <span className="w-14 text-right font-display text-lg tnum">
                {p.pieces}
                <span className="ml-1 text-[10px]" style={{ color: 'var(--muted)' }}>pç</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-2">
        <button
          onClick={share}
          className="rounded-lg py-3 font-semibold"
          style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}
        >
          {copied ? 'Link copiado!' : 'Compartilhar resultado'}
        </button>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg border py-3 font-semibold"
          style={{ borderColor: 'var(--line)', color: 'var(--rice)' }}
        >
          Nova mesa
        </button>
      </div>
    </main>
  );
}

function Badge({ emoji, label, value, sub, tone }) {
  const color = tone === 'good' ? 'var(--wasabi)' : tone === 'bad' ? 'var(--tuna)' : 'var(--rice)';
  return (
    <div className="rounded-xl border p-3" style={{ background: 'var(--slate)', borderColor: 'var(--line)' }}>
      <p className="text-lg leading-none">{emoji}</p>
      <p className="mt-1.5 text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="truncate font-semibold" style={{ color }}>{value || '—'}</p>
      {sub && <p className="text-xs tnum" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  );
}
