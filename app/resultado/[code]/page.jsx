import Link from 'next/link';
import { getResult } from '@/lib/result';
import ResultView from '@/components/ResultView';

export async function generateMetadata({ params }) {
  const { code } = await params;
  const data = await getResult(code);
  if (!data) return { title: 'Sushi Battle' };

  const champ = [...data.players].sort((a, b) => b.pieces - a.pieces)[0];
  const title = champ
    ? `🏆 ${champ.name} venceu a ${data.room.name}`
    : `Resultado — ${data.room.name}`;
  const description = champ
    ? `${champ.name} comeu ${champ.pieces} peças no Sushi Battle. Cê aguenta mais?`
    : 'Resultado do rodízio no Sushi Battle.';

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ResultadoPage({ params }) {
  const { code } = await params;
  const data = await getResult(code);

  if (!data) {
    return (
      <main className="mx-auto grid min-h-[100dvh] max-w-md place-items-center px-6 text-center">
        <div>
          <p className="font-display text-3xl">Mesa não encontrada</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            Esse código não existe mais.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg px-5 py-3 font-semibold"
            style={{ background: 'var(--salmon)', color: 'var(--salmon-ink)' }}
          >
            Criar uma mesa
          </Link>
        </div>
      </main>
    );
  }

  return <ResultView room={data.room} players={data.players} />;
}
