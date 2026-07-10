'use client';
import { useMemo } from 'react';
import FoodCard from './FoodCard';

export default function Counter({ items, counts, onChange }) {
  // group by category once — 96 items is a lot to scan flat on a phone
  const groups = useMemo(() => {
    const by = new Map();
    for (const it of items) {
      if (!by.has(it.cat)) by.set(it.cat, []);
      by.get(it.cat).push(it);
    }
    return [...by.entries()];
  }, [items]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {groups.map(([cat, catItems]) => (
        <section key={cat}>
          <h2
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--muted)' }}
          >
            {cat}
          </h2>
          <ul className="flex flex-col gap-2">
            {catItems.map((it) => (
              <FoodCard
                key={it.id}
                item={it}
                count={counts[it.id] || 0}
                onAdd={() => onChange(it, +1)}
                onRemove={() => onChange(it, -1)}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
