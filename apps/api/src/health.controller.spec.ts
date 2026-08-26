import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns an API health response', () => {
    const response = new HealthController().getHealth();
    expect(response.status).toBe('ok');
    expect(response.service).toBe('api');
  });
});
