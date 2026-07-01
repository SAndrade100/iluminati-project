import { otelSDK } from '@app/observability';
otelSDK.start();
import { NestFactory } from '@nestjs/core';
import { PedidosModule } from './pedidos.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES } from '@app/events';

async function bootstrap() {
  const app = await NestFactory.create(PedidosModule);

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://iluminati:iluminati_rabbit@localhost:5672'],
      queue: QUEUES.PEDIDOS,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Iluminati — Pedidos Service')
    .setDescription('Criação e gestão de pedidos e carrinho de compras')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addTag('orders')
    .addTag('cart')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
