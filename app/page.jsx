import CreateTableForm from '@/components/CreateTableForm';
import JoinTableForm from '@/components/JoinTableForm';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pb-10 pt-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--salmon)' }}>
          🍣 Sushi Battle
        </p>
        <h1 className="mt-3 font-display text-5xl leading-[0.95]">
          A mesa toda
          <br />
          contra o<br />
          restaurante.
        </h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
          Cada um conta o que come. Peça a peça, o placar diz quem tá lucrando no rodízio.
        </p>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          Criar mesa
        </h2>
        <CreateTableForm />
      </section>

      <div className="my-2 flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
        ou entra numa
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
      </div>

      <section>
        <JoinTableForm />
      </section>
    </main>
  );
}
