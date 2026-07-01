import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { EVENTS, OrderCreatedEvent } from '@app/events';
import { PagamentosService } from './pagamentos.service';

@Controller()
export class PagamentosEventsController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @EventPattern(EVENTS.ORDER_CREATED)
  async onOrderCreated(
    @Payload() event: OrderCreatedEvent,
    @Ctx() ctx: RmqContext,
  ) {
    const channel = ctx.getChannelRef();
    const message = ctx.getMessage();
    try {
      await this.pagamentosService.processFromEvent(event);
      channel.ack(message);
    } catch (err) {
      channel.nack(message, false, false);
    }
  }
}
