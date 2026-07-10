export const profitCents = (valueCents, rodizioPriceCents) =>
  (valueCents | 0) - (rodizioPriceCents | 0);

export const formatBRL = (cents) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
