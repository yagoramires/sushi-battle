import { MdAdd, MdRemove } from 'react-icons/md';
import { formatBRL } from '@/lib/money';

export default function FoodCard({ item, count, onAdd, onRemove }) {
  const active = count > 0;
  return (
    <li
      className="flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
      style={{
        background: 'var(--slate)',
        borderColor: active ? 'var(--salmon)' : 'var(--line)',
      }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{item.name}</p>
        <p className="text-xs tnum" style={{ color: 'var(--muted)' }}>
          {formatBRL(item.valueCents)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onRemove}
          disabled={!active}
          aria-label={`Remover um ${item.name}`}
          className="grid h-9 w-9 place-items-center rounded-lg text-xl disabled:opacity-30"
          style={{ background: 'var(--slate-2)', color: 'var(--rice)' }}
        >
          <MdRemove aria-hidden />
        </button>
        <span
          className="w-8 text-center font-display text-xl tnum"
          style={{ color: active ? 'var(--salmon)' : 'var(--muted)' }}
        >
          {count}
        </span>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Adicionar um ${item.name}`}
          className="grid h-9 w-9 place-items-center rounded-lg text-xl"
          style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}
        >
          <MdAdd aria-hidden />
        </button>
      </div>
    </li>
  );
}
