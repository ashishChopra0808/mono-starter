import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { createLogger } from '@mono/logger/node';

import {
  CorrelationIdMiddleware,
  LoggingInterceptor,
  ROOT_LOGGER,
} from '../logging';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectModule } from './project/project.module';

const rootLogger = createLogger({ name: 'api' });

@Module({
  imports: [ProjectModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: ROOT_LOGGER, useValue: rootLogger },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
