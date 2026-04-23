import { createLogger } from '@mono/logger/node';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
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
    // Global auth: all routes require a valid JWT unless decorated with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global authz: checks @Roles() if present, otherwise allows any authenticated user
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
