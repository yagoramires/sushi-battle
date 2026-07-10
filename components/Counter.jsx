'use client';
import { useState, useRef } from 'react';
import menu from '@/menu.json';
import FoodCard from './FoodCard';
import { applyDelta, pushPlayer } from '@/lib/consume';

export default function Counter({ room, player }) {
  const items = menu[room.menu];
  const initial = { pieces: player.pieces, value_cents: player.value_cents, counts: player.counts || {} };
  const [state, setState] = useState(initial);
  // ref mirrors latest state so rapid taps chain off the newest value,
  // not a stale render closure (fast tapping would otherwise drop pieces).
  const latest = useRef(initial);
  const pushTimer = useRef(null);

  function change(item, delta) {
    const next = applyDelta(latest.current, item, delta);
    latest.current = next;
    setState(next); // optimistic, instant
    // Debounce the write: each push replaces the whole row, so rapid taps
    // must not fire concurrent full-row updates (they arrive out of order and
    // last-writer-wins would drop pieces). Coalesce to one push of the final
    // state. ponytail: 150ms trailing debounce; pushes >150ms apart can still
    // race in theory, but that's not a fast-tap; upgrade to a serial queue if
    // it ever matters.
    clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => pushPlayer(player.id, latest.current), 150);
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
