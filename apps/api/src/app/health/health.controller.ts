import { Controller, Get } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now();

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }
}
