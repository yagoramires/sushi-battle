import { writeFileSync } from 'node:fs';

const URL = 'https://customers.tagme.com.br/dine-in/menu/645bf05293c09d0056176767/Dine-in?ignoreDisabled=1';

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\(.*?\)/g, '').replace(/\bnovo\b|\bnovidade\b|\bpreferido\b|und\.?|\d+/g, '')
  .replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const catKey = (s) => norm(s).replace(/s$/, '').replace('makimono', 'roll').trim();
const slug = (cat, name) => (norm(cat) + '-' + norm(name)).replace(/\s+/g, '-');

// exact override in cents for the 11 rodízio items with no à-la-carte category match.
// Keys are the fully-hyphenated `id` (slug(cat, name)) produced below, not the
// space-separated form — matchIn() is called with overrideKey = id.
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
    if (p > 0) alaByCat[ck].push({ toks: new Set(norm(it.name.pt).split(' ').filter(Boolean)), price: p });
  }
}
const matchIn = (cat, name, overrideKey) => {
  if (OVERRIDES[overrideKey] != null) return OVERRIDES[overrideKey];
  const pool = alaByCat[catKey(cat)] || [];
  const toks = new Set(norm(name).split(' ').filter(Boolean));
  let best = null, bs = 0;
  for (const a of pool) {
    let i = 0; for (const t of toks) if (a.toks.has(t)) i++;
    const sc = i / Math.max(1, Math.max(toks.size, a.toks.size));
    if (sc > bs) { bs = sc; best = a; }
  }
  if (best && bs >= 0.34) return best.price;
  if (pool.length) return Math.round(pool.reduce((s, a) => s + a.price, 0) / pool.length);
  return null;
};
const buildRoot = (rootName) => {
  const root = rootBy(rootName);
  const out = [];
  for (const m of root.menus) for (const it of m.menuItems || []) {
    const name = it.name.pt.replace(/\s+/g, ' ').trim();
    const id = slug(m.name.pt, name);
    const valueCents = matchIn(m.name.pt, name, id);
    if (valueCents == null || valueCents <= 0) throw new Error('unpriced: ' + id);
    out.push({ id, name, cat: m.name.pt.trim(), valueCents });
  }
  return out;
};

const menu = { rodizio: buildRoot('rodizio'), executivo: buildRoot('rodizio executivo') };
writeFileSync('menu.json', JSON.stringify(menu, null, 2));
console.log('rodizio', menu.rodizio.length, 'executivo', menu.executivo.length);
