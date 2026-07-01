import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PedidosController } from './pedidos.controller';
import { PedidosEventsController } from './pedidos-events.controller';
import { PedidosService } from './pedidos.service';
import { CartController } from './cart/cart.controller';
import { CartService } from './cart/cart.service';
import { ObservabilityModule, HealthModule } from '@app/observability';
import { DatabaseModule } from '@app/database';
import { AuthCommonModule } from '@app/auth-common';
import { QUEUES } from '@app/events';

@Module({
  imports: [
    ObservabilityModule,
    DatabaseModule,
    AuthCommonModule,
    HealthModule,
    ClientsModule.register([
      {
        name: 'PAGAMENTOS_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://iluminati:iluminati_rabbit@localhost:5672'],
          queue: QUEUES.PAGAMENTOS,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [PedidosController, PedidosEventsController, CartController],
  providers: [PedidosService, CartService],
})
export class PedidosModule {}
