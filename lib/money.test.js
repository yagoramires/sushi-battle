import { describe, it, expect } from 'vitest';
import { profitCents, formatBRL, parseBRLToCents } from './money.js';

describe('money', () => {
  it('profit is value minus rodizio price in cents', () => {
    expect(profitCents(12000, 8990)).toBe(3010);
    expect(profitCents(5000, 8990)).toBe(-3990);
  });
  it('parses BRL input to cents', () => {
    expect(parseBRLToCents('89,90')).toBe(8990);
    expect(parseBRLToCents('89.90')).toBe(8990);
    expect(parseBRLToCents('R$ 1.234,56')).toBe(123456);
    expect(parseBRLToCents('120')).toBe(12000);
  });
  it('rejects invalid or non-positive input', () => {
    expect(parseBRLToCents('')).toBeNaN();
    expect(parseBRLToCents('abc')).toBeNaN();
    expect(parseBRLToCents('0')).toBeNaN();
  });
  it('formats cents as BRL', () => {
    expect(formatBRL(3890)).toBe('R$ 38,90');
  });
});
