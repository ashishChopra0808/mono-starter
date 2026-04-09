import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { createLogger } from '@mono/logger/node';

import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import {
  CorrelationIdMiddleware,
  LoggingInterceptor,
  ROOT_LOGGER,
} from '../logging';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProjectModule } from './project/project.module';
import { UsersModule } from './users/users.module';

const rootLogger = createLogger({ name: 'api' });

@Module({
  imports: [HealthModule, AuthModule, UsersModule, ProjectModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: ROOT_LOGGER, useValue: rootLogger },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
