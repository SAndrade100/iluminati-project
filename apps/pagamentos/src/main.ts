import { otelSDK } from '@app/observability';
otelSDK.start();
import { NestFactory } from '@nestjs/core';
import { PagamentosModule } from './pagamentos.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUES } from '@app/events';

async function bootstrap() {
  const app = await NestFactory.create(PagamentosModule);

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://iluminati:iluminati_rabbit@localhost:5672'],
      queue: QUEUES.PAGAMENTOS,
      queueOptions: { durable: true },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
