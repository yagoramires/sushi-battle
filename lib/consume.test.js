import { describe, it, expect } from 'vitest';
import { applyDelta } from './consume.js';
const base = { pieces: 0, value_cents: 0, counts: {} };
const item = { id: 'sushi-salmao', valueCents: 2190 };
describe('applyDelta', () => {
  it('adds a piece and its value', () => {
    expect(applyDelta(base, item, +1)).toEqual({ pieces: 1, value_cents: 2190, counts: { 'sushi-salmao': 1 } });
  });
  it('never goes below zero', () => {
    expect(applyDelta(base, item, -1)).toEqual({ pieces: 0, value_cents: 0, counts: { 'sushi-salmao': 0 } });
  });
});
