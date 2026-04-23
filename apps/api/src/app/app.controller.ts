import { createLogger } from '@mono/logger/node';
import { Controller, Get } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { AppService } from './app.service';

interface AppData {
  message: string;
}

const logger = createLogger({ name: 'app-controller' });

@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(): AppData {
    logger.info({ action: 'getData' }, 'Handling getData request');
    return this.appService.getData();
  }
}
