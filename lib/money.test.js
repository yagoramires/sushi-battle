import { describe, it, expect } from 'vitest';
import { profitCents, formatBRL } from './money.js';

describe('money', () => {
  it('profit is value minus rodizio price in cents', () => {
    expect(profitCents(12000, 8990)).toBe(3010);
    expect(profitCents(5000, 8990)).toBe(-3990);
  });
  it('formats cents as BRL', () => {
    expect(formatBRL(3890)).toBe('R$ 38,90');
  });
});
