import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { apiEnv } from '@mono/env/api';
import { createLogger } from '@mono/logger/node';

import { AppModule } from './app/app.module';
import { PinoLoggerAdapter } from './logging';

const logger = createLogger({ name: 'api' });

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: new PinoLoggerAdapter(logger),
  });

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix, {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = apiEnv.PORT;
  await app.listen(port);
  logger.info(
    { port, globalPrefix },
    `Application is running on http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
