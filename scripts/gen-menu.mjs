import { writeFileSync } from 'node:fs';

const URL = 'https://customers.tagme.com.br/dine-in/menu/645bf05293c09d0056176767/Dine-in?ignoreDisabled=1';

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\(.*?\)/g, '').replace(/\bnovo\b|\bnovidade\b|\bpreferido\b|und\.?|\d+/g, '')
  .replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const catKey = (s) => norm(s).replace(/s$/, '').replace('makimono', 'roll').trim();
const slug = (cat, name) => (norm(cat) + '-' + norm(name)).replace(/\s+/g, '-');

// À-la-carte prices are for a whole portion (several pieces); in the rodízio you
// count individual pieces, so the per-piece value = portion price / pieces.
// Pieces come from the à-la-carte name ("(5 und.)", "(10 fatias)") when present,
// else from these per-category rules (confirmed with the client).
const countFrom = (s) => {
  const m = (s || '').match(/(\d+)\s*(?:und|unidades?|fatias?|pe[cç]as?)/i);
  return m ? parseInt(m[1], 10) : null;
};
const PIECE_RULES = [
  [/marinado/, 30],
  [/sashimi/, 5],
  [/gunka/, 2],
  [/sushi/, 2],
  [/temaki/, 1],
  [/onigiri/, 1],
  [/hot/, 8],
  [/roll|makimono|hossomaki|uramaki/, 8],
  [/yakissoba|teppan/, 2],
  [/entrada/, 1],
  [/sobremesa/, 1],
];
const piecesFor = (cat, name, refName) => {
  const explicit = countFrom(refName) ?? countFrom(name);
  if (explicit && explicit > 0) return explicit;
  const s = norm(cat + ' ' + name);
  for (const [re, n] of PIECE_RULES) if (re.test(s)) return n;
  return 1;
};

// portion price in cents for the 11 rodízio items with no à-la-carte category match.
// Keys are the fully-hyphenated `id` (slug(cat, name)).
const OVERRIDES = {
  'onigiri-onigiri-camarao': 1990, 'onigiri-onigiri-atum-kewpie': 2090,
  'onigiri-onigiri-pipoca-de-tilapia': 1990, 'onigiri-onigiri-salmao-completo': 2190,
  'onigiri-onigiri-salmao': 2190, 'novidades-menu-rodizio-ceviche': 4190,
  'novidades-menu-rodizio-sushi-salmao': 2190, 'novidades-menu-rodizio-sushi-atum': 2090,
  'novidades-menu-rodizio-sushi-peixe-branco': 1990, 'novidades-menu-rodizio-mini-hot-chilli': 3390,
  'novidades-menu-rodizio-marinado-peixe-branco': 3460,
};

const data = await (await fetch(URL)).json();
const rootBy = (n) => data.find((r) => norm(r.name?.pt) === n);

const alaByCat = {};
for (const m of rootBy('a la carte').menus) {
  const ck = catKey(m.name.pt);
  (alaByCat[ck] ||= []);
  for (const it of m.menuItems || []) {
    const p = it.price ?? it.value ?? 0;
    if (p > 0) alaByCat[ck].push({ name: it.name.pt, toks: new Set(norm(it.name.pt).split(' ').filter(Boolean)), price: p });
  }
}

// Returns { portion: cents, refName } — portion price of the matched à-la-carte item.
const matchIn = (cat, name, overrideKey) => {
  if (OVERRIDES[overrideKey] != null) return { portion: OVERRIDES[overrideKey], refName: null };
  const pool = alaByCat[catKey(cat)] || [];
  const toks = new Set(norm(name).split(' ').filter(Boolean));
  let best = null, bs = 0;
  for (const a of pool) {
    let i = 0; for (const t of toks) if (a.toks.has(t)) i++;
    const sc = i / Math.max(1, Math.max(toks.size, a.toks.size));
    if (sc > bs) { bs = sc; best = a; }
  }
  if (best && bs >= 0.34) return { portion: best.price, refName: best.name };
  if (pool.length) return { portion: Math.round(pool.reduce((s, a) => s + a.price, 0) / pool.length), refName: null };
  return null;
};

const buildRoot = (rootName) => {
  const root = rootBy(rootName);
  const out = [];
  for (const m of root.menus) for (const it of m.menuItems || []) {
    const name = it.name.pt.replace(/\s+/g, ' ').trim();
    const id = slug(m.name.pt, name);
    const match = matchIn(m.name.pt, name, id);
    if (!match || match.portion <= 0) throw new Error('unpriced: ' + id);
    const pieces = piecesFor(m.name.pt, name, match.refName);
    const valueCents = Math.max(1, Math.round(match.portion / pieces));
    out.push({ id, name, cat: m.name.pt.trim(), valueCents });
  }
  return out;
};

const menu = { rodizio: buildRoot('rodizio'), executivo: buildRoot('rodizio executivo') };
writeFileSync('menu.json', JSON.stringify(menu, null, 2));
console.log('rodizio', menu.rodizio.length, 'executivo', menu.executivo.length);
