import { NestFactory } from '@nestjs/core';
import { CatalogoModule } from './catalogo.module';

async function bootstrap() {
  const app = await NestFactory.create(CatalogoModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
