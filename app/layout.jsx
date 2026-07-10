import './globals.css';
import { Anton, Inter } from 'next/font/google';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Sushi Battle',
  description: 'A mesa toda contra o restaurante.',
};

export const viewport = {
  themeColor: '#0F0F10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // no accidental zoom while tapping fast
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${inter.variable}`}>
      <body className="min-h-[100dvh] antialiased">{children}</body>
    </html>
  );
}
