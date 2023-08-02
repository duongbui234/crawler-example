import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';

import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionsFilter } from './middlewares/global-exceptions.filter';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule, { cors: true });
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionsFilter(httpAdapter));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);
}

bootstrap();
