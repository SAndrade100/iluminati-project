import {
  Injectable, NotFoundException, BadRequestException, Logger, Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService, OrderStatus, ProductStatus } from '@app/database';
import { MetricsService } from '@app/observability';
import { EVENTS, OrderCreatedEvent, PaymentProcessedEvent } from '@app/events';
import { CreateOrderDto } from './dto/create-order.dto';
import { CouponService } from './coupons/coupon.service';

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('PAGAMENTOS_CLIENT') private readonly pagamentosClient: ClientProxy,
    private readonly metrics: MetricsService,
    private readonly couponService: CouponService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, status: ProductStatus.ACTIVE },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found or inactive');
    }

    // Validate stock for every item
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product '${product.name}' (available: ${product.stock})`,
        );
      }
    }

    const subtotal = dto.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + Number(product.price) * item.quantity;
    }, 0);

    // Aplica cupom se fornecido
    let discountAmount = 0;
    let couponId: string | undefined;
    if (dto.couponCode) {
      const result = await this.couponService.validate(dto.couponCode, subtotal);
      discountAmount = result.discount;
      couponId = result.coupon.id;
    }
    const totalPrice = Math.max(0, subtotal - discountAmount);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalPrice,
          discountAmount: discountAmount > 0 ? discountAmount : undefined,
          couponId,
          items: {
            create: dto.items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
              };
            }),
          },
          payment: {
            create: {
              method: dto.paymentMethod,
              amountPaid: totalPrice,
            },
          },
        },
        include: { items: true, payment: true },
      });

      // Decrement stock atomically
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Registra uso do cupom
      if (couponId) {
        await tx.couponUsage.create({
          data: { couponId, userId, orderId: created.id },
        });
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    this.logger.log(`Order created: ${order.id} for user ${userId}`);
    this.metrics.recordOrderCreated(totalPrice);

    // Publica evento para pagamentos processar automaticamente
    const event: OrderCreatedEvent = {
      orderId: order.id,
      userId,
      totalPrice,
      paymentId: order.payment.id,
      paymentMethod: dto.paymentMethod,
    };
    this.pagamentosClient.emit(EVENTS.ORDER_CREATED, event);

    return order;
  }

  async findAllByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { items: { include: { product: true } }, payment: true },
    });
    if (!order) throw new NotFoundException(`Order '${id}' not found`);
    return order;
  }

  async handlePaymentProcessed(event: PaymentProcessedEvent) {
    const newStatus =
      event.status === 'APPROVED' ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;

    await this.prisma.order.update({
      where: { id: event.orderId },
      data: { status: newStatus },
    });

    this.logger.log(`Order ${event.orderId} updated to ${newStatus} (payment: ${event.status})`);

    // Se recusado, restaura estoque
    if (event.status === 'REFUSED') {
      const items = await this.prisma.orderItem.findMany({ where: { orderId: event.orderId } });
      for (const item of items) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

  async cancel(id: string, userId: string) {
    const order = await this.findOne(id, userId);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel an order with status '${order.status}'`);
    }

    return this.prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      const cancelled = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true, payment: true },
      });
      this.metrics.recordOrderCancelled();
      return cancelled;
    });
  }
}
