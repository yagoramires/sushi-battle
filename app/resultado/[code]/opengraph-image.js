import { ImageResponse } from 'next/og';
import { getResult } from '@/lib/result';
import { profitCents } from '@/lib/money';

export const alt = 'Resultado Sushi Battle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NORI = '#0f0f10';
const RICE = '#faf9f5';
const MUTED = '#8b8b93';
const SALMON = '#ff7a4d';
const WASABI = '#7ccf6a';
const TUNA = '#ff4d5e';

const brl = (c) =>
  (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function Image({ params }) {
  const { code } = await params;
  const data = await getResult(code);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: NORI,
            color: SALMON,
            fontSize: 72,
            fontWeight: 800,
          }}
        >
          Sushi Battle
        </div>
      ),
      size
    );
  }

  const players = [...data.players].sort((a, b) => b.pieces - a.pieces);
  const champ = players[0];
  const tableProfit = data.players.reduce(
    (s, p) => s + profitCents(p.value_cents, data.room.rodizio_price),
    0
  );
  const won = tableProfit >= 0;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: NORI,
          color: RICE,
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: SALMON, fontSize: 30, fontWeight: 800, letterSpacing: 8 }}>
            SUSHI BATTLE
          </span>
          <span style={{ color: MUTED, fontSize: 30 }}>{data.room.name}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: MUTED, fontSize: 32, letterSpacing: 4 }}>CAMPEÃO DA MESA</span>
          <span style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.05 }}>
            {champ ? champ.name : '—'}
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 6 }}>
            <span style={{ fontSize: 150, fontWeight: 800, color: SALMON, lineHeight: 1 }}>
              {champ ? champ.pieces : 0}
            </span>
            <span style={{ fontSize: 40, color: MUTED, marginLeft: 16, marginBottom: 22 }}>peças</span>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: `5px solid ${won ? WASABI : TUNA}`,
              color: won ? WASABI : TUNA,
              padding: '16px 34px',
              borderRadius: 18,
              transform: 'rotate(-3deg)',
            }}
          >
            <span style={{ fontSize: 46, fontWeight: 800 }}>
              {won ? 'A MESA VENCEU' : 'O RESTAURANTE LEVOU'}
            </span>
            <span style={{ fontSize: 34, fontWeight: 700, marginLeft: 22 }}>
              {won ? `+${brl(tableProfit)}` : brl(tableProfit)}
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
