'use client';
import { useState } from 'react';
import menu from '@/menu.json';
import FoodCard from './FoodCard';
import { applyDelta, pushPlayer } from '@/lib/consume';

export default function Counter({ room, player }) {
  const items = menu[room.menu];
  const [state, setState] = useState({ pieces: player.pieces, value_cents: player.value_cents, counts: player.counts || {} });

  function change(item, delta) {
    const next = applyDelta(state, item, delta);
    setState(next);            // optimistic
    pushPlayer(player.id, next); // fire-and-forget upsert
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <FoodCard key={it.id} item={it} count={state.counts[it.id] || 0}
          onAdd={() => change(it, +1)} onRemove={() => change(it, -1)} />
      ))}
    </div>
  );
}
