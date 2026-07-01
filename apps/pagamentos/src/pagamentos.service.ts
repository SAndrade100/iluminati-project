import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService, PaymentStatus } from '@app/database';
import { MetricsService } from '@app/observability';
import { EVENTS, OrderCreatedEvent, PaymentProcessedEvent } from '@app/events';

@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('PEDIDOS_CLIENT') private readonly pedidosClient: ClientProxy,
    private readonly metrics: MetricsService,
  ) {}

  async findByOrder(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException(`Payment for order '${orderId}' not found`);
    return payment;
  }

  async process(orderId: string) {
    const payment = await this.findByOrder(orderId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Payment already in status '${payment.status}'`);
    }

    return this.executeProcessing(orderId, payment.id);
  }

  /** Chamado via evento order.created — sem checar status anterior */
  async processFromEvent(event: OrderCreatedEvent) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId: event.orderId } });
    if (!payment || payment.status !== PaymentStatus.PENDING) return;

    await this.executeProcessing(event.orderId, payment.id);
  }

  private async executeProcessing(orderId: string, paymentId: string) {
    const approved = Math.random() < 0.9;
    const newStatus = approved ? PaymentStatus.APPROVED : PaymentStatus.REFUSED;
    const externalRef = approved ? `mock_txn_${Date.now()}` : null;

    const updated = await this.prisma.payment.update({
      where: { orderId },
      data: { status: newStatus, externalRef, processedAt: new Date() },
    });

    this.logger.log(`Payment ${paymentId} for order ${orderId}: ${newStatus}`);
    this.metrics.recordPaymentProcessed(approved ? 'APPROVED' : 'REFUSED');

    const event: PaymentProcessedEvent = {
      orderId,
      paymentId,
      status: approved ? 'APPROVED' : 'REFUSED',
      externalRef,
    };
    this.pedidosClient.emit(EVENTS.PAYMENT_PROCESSED, event);

    return updated;
  }

  async refund(orderId: string) {
    const payment = await this.findByOrder(orderId);

    if (payment.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException(`Only approved payments can be refunded`);
    }

    return this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.REFUNDED, processedAt: new Date() },
    });
  }
}
