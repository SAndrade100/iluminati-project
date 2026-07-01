import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService, ProductStatus, PaymentMethod } from '@app/database';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { PedidosService } from '../pedidos.service';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pedidosService: PedidosService,
  ) {}

  private async getOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true, stock: true, status: true } } },
        },
      },
    });
  }

  async getCart(userId: string) {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product || product.status !== ProductStatus.ACTIVE)
      throw new NotFoundException(`Product '${dto.productId}' not found or inactive`);
    if (product.stock < dto.quantity)
      throw new BadRequestException(`Only ${product.stock} units available`);

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items.find((i) => i.productId === dto.productId);
    const newQty = (existingItem?.quantity ?? 0) + dto.quantity;
    if (product.stock < newQty)
      throw new BadRequestException(`Only ${product.stock} units available`);

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
      create: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity },
      update: { quantity: newQty },
    });

    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) return this.removeItem(userId, productId);

    const cart = await this.getOrCreateCart(userId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new NotFoundException('Item not in cart');

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (product.stock < quantity)
      throw new BadRequestException(`Only ${product.stock} units available`);

    await this.prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });
    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared' };
  }

  async checkout(userId: string, paymentMethod: PaymentMethod) {
    const cart = await this.getOrCreateCart(userId);
    if (cart.items.length === 0)
      throw new BadRequestException('Cart is empty');

    const order = await this.pedidosService.create(userId, {
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      paymentMethod,
    });

    // Esvazia o carrinho após checkout com sucesso
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  }
}
