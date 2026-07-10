import { describe, it, expect } from 'vitest';
import { genCode } from './rooms.js';

describe('genCode', () => {
  it('returns 6 unambiguous chars', () => {
    const c = genCode();
    expect(c).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });
});
