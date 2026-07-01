import { otelSDK } from '@app/observability';
otelSDK.start();
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  app.useLogger(app.get(Logger));

  app.use(helmet());

  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
