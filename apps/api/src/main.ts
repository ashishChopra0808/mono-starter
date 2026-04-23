import { apiEnv } from '@mono/env/api';
import { createLogger } from '@mono/logger/node';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { PinoLoggerAdapter } from './logging';

const logger = createLogger({ name: 'api' });

/**
 * Reject the default JWT_SECRET from .env.example.
 * This prevents accidental deployment with an insecure secret.
 */
const INSECURE_SECRETS = [
  'change-me-to-a-32-character-minimum-secret-key',
];

async function bootstrap(): Promise<void> {
  if (INSECURE_SECRETS.includes(apiEnv.JWT_SECRET)) {
    logger.fatal(
      'JWT_SECRET is set to the default placeholder value. ' +
        'Generate a secure secret before running the application: ' +
        'openssl rand -base64 48',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger: new PinoLoggerAdapter(logger),
  });

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // ── Security ────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: apiEnv.CORS_ORIGINS.split(',').map((o) => o.trim()),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable shutdown hooks so NestJS lifecycle events fire on SIGTERM/SIGINT.
  // This allows DatabaseModule.onApplicationShutdown() to close connections.
  app.enableShutdownHooks();

  const port = apiEnv.PORT;
  await app.listen(port);
  logger.info(
    { port, globalPrefix },
    `Application is running on http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
