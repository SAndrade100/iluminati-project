import { otelSDK } from '@app/observability';
otelSDK.start();
import { NestFactory } from '@nestjs/core';
import { CatalogoModule } from './catalogo.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(CatalogoModule);
  app.useLogger(app.get(Logger));
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
