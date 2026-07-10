// Importing lib/rooms.js pulls in lib/supabase.js, which reads
// NEXT_PUBLIC_* env vars at module load time. Load .env.local (if present)
// so that import doesn't throw during tests that never touch the network.
try {
  process.loadEnvFile('.env.local');
} catch {
  // no .env.local (e.g. CI) — fine, as long as no test actually hits Supabase.
}
