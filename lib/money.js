export const profitCents = (valueCents, rodizioPriceCents) =>
  (valueCents | 0) - (rodizioPriceCents | 0);

export const formatBRL = (cents) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Parse a user-typed BRL amount to integer cents. Accepts "89,90", "89.90",
// and "1.234,56". Returns NaN for empty/non-numeric/non-positive input so the
// caller can reject it instead of inserting a null/NaN price.
export function parseBRLToCents(input) {
  if (typeof input !== 'string') return NaN;
  let s = input.trim().replace(/[^\d.,]/g, '');
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56 -> 1234.56
  } else {
    s = s.replace(',', '.'); // 89,90 or 89.90 -> 89.90
  }
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n <= 0) return NaN;
  return Math.round(n * 100);
}
