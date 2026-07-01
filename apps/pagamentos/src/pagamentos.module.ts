import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosEventsController } from './pagamentos-events.controller';
import { PagamentosService } from './pagamentos.service';
import { ObservabilityModule, HealthModule } from '@app/observability';
import { DatabaseModule } from '@app/database';
import { AuthCommonModule } from '@app/auth-common';
import { QUEUES } from '@app/events';
import { buildConfigModule, AUTH_ENV_SCHEMA, RABBITMQ_ENV_SCHEMA } from '@app/config';

@Module({
  imports: [
    buildConfigModule({ ...AUTH_ENV_SCHEMA, ...RABBITMQ_ENV_SCHEMA }),
    ObservabilityModule,
    DatabaseModule,
    AuthCommonModule,
    HealthModule,
    ClientsModule.register([
      {
        name: 'PEDIDOS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://iluminati:iluminati_rabbit@localhost:5672'],
          queue: QUEUES.PEDIDOS,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [PagamentosController, PagamentosEventsController],
  providers: [PagamentosService],
})
export class PagamentosModule {}
