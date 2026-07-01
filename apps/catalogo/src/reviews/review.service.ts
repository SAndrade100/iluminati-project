import {
  Injectable, NotFoundException, ConflictException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(productId: string, userId: string, dto: CreateReviewDto) {
    // Verifica se o produto existe
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product '${productId}' not found`);

    // Verifica se já avaliou
    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictException('You already reviewed this product');

    // Se forneceu orderId, valida que o pedido pertence ao usuário e contém o produto
    if (dto.orderId) {
      const orderItem = await this.prisma.orderItem.findFirst({
        where: { orderId: dto.orderId, productId, order: { userId } },
      });
      if (!orderItem) {
        throw new BadRequestException('Order does not belong to you or does not contain this product');
      }
    }

    return this.prisma.review.create({
      data: { userId, productId, orderId: dto.orderId, rating: dto.rating, comment: dto.comment },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async findByProduct(productId: string) {
    const [reviews, stats] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);
    return {
      stats: {
        average: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : null,
        total: stats._count.id,
      },
      reviews,
    };
  }

  async remove(reviewId: string, userId: string, role: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review '${reviewId}' not found`);
    if (review.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    return this.prisma.review.delete({ where: { id: reviewId } });
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { product: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
