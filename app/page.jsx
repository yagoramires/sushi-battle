import CreateTableForm from '@/components/CreateTableForm';
import JoinTableForm from '@/components/JoinTableForm';

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-8 p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mt-6">🍣 Sushi Battle</h1>
      <p className="text-xs text-center text-zinc-400">A mesa toda contra o restaurante.</p>
      <section className="w-full"><h2 className="mb-2 font-semibold">Criar mesa</h2><CreateTableForm /></section>
      <div className="text-zinc-500 text-sm">ou</div>
      <section className="w-full"><h2 className="mb-2 font-semibold">Entrar numa mesa</h2><JoinTableForm /></section>
    </main>
  );
}
