import { Controller, Get } from '@nestjs/common';
import { healthResponseSchema, type HealthResponse } from '@av/contracts';

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return healthResponseSchema.parse({
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    });
  }
}
