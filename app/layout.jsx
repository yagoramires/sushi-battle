import './globals.css';
export const metadata = { title: 'Sushi Battle' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-800 text-white min-h-[100dvh]">{children}</body>
    </html>
  );
}
