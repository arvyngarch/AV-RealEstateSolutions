import { describe, expect, it } from 'vitest';

describe('web application', () => {
  it('has a configured API URL default', () => {
    expect(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').toBe('http://localhost:3001');
  });
});
