import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { EVENTS, PaymentProcessedEvent } from '@app/events';
import { PedidosService } from './pedidos.service';

@Controller()
export class PedidosEventsController {
  constructor(private readonly pedidosService: PedidosService) {}

  @EventPattern(EVENTS.PAYMENT_PROCESSED)
  async onPaymentProcessed(
    @Payload() event: PaymentProcessedEvent,
    @Ctx() ctx: RmqContext,
  ) {
    const channel = ctx.getChannelRef();
    const message = ctx.getMessage();
    try {
      await this.pedidosService.handlePaymentProcessed(event);
      channel.ack(message);
    } catch (err) {
      // Requeue once on failure, then discard to avoid infinite loops
      channel.nack(message, false, false);
    }
  }
}
