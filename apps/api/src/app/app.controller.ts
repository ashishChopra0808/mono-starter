import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

interface AppData {
  message: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(): AppData {
    return this.appService.getData();
  }
}
