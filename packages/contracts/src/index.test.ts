import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from './index.js';

describe('healthResponseSchema', () => {
  it('accepts a valid API health response', () => {
    expect(
      healthResponseSchema.safeParse({
        status: 'ok',
        service: 'api',
        timestamp: '2026-08-26T12:00:00.000Z',
      }).success,
    ).toBe(true);
  });
});
