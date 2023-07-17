import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionsFilter } from './middlewares/global-exceptions.filter';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, { cors: true });
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionsFilter(httpAdapter));
  await app.listen(5000);
}

bootstrap();
