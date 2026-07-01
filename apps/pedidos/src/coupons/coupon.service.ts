import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService, DiscountType } from '@app/database';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { PageQueryDto, paginate, paginationParams } from '@app/database';

@Injectable()
export class CouponService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`Coupon code '${code}' already exists`);

    return this.prisma.coupon.create({
      data: {
        ...dto,
        code,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async findAll(query: PageQueryDto) {
    const { skip, take } = paginationParams(query);
    const [data, total] = await Promise.all([
      this.prisma.coupon.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { usages: true } } },
      }),
      this.prisma.coupon.count(),
    ]);
    return paginate(data, total, query.page ?? 1, take);
  }

  async validate(code: string, orderSubtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!coupon) throw new NotFoundException(`Coupon '${code}' not found`);
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      throw new BadRequestException('Coupon has expired');
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
      throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderValue && orderSubtotal < Number(coupon.minOrderValue))
      throw new BadRequestException(
        `Minimum order value of R$ ${coupon.minOrderValue} required`,
      );

    const discount = this.calculateDiscount(coupon, orderSubtotal);
    return { coupon, discount, finalTotal: Math.max(0, orderSubtotal - discount) };
  }

  calculateDiscount(coupon: { discountType: DiscountType; discountValue: any }, subtotal: number) {
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      return Math.round((subtotal * Number(coupon.discountValue)) / 100 * 100) / 100;
    }
    return Math.min(Number(coupon.discountValue), subtotal);
  }

  async toggle(id: string, isActive: boolean) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon '${id}' not found`);
    return this.prisma.coupon.update({ where: { id }, data: { isActive } });
  }

  async findOne(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: { _count: { select: { usages: true } } },
    });
    if (!coupon) throw new NotFoundException(`Coupon '${code}' not found`);
    return coupon;
  }
}
