import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService, ProductStatus } from '@app/database';
import { paginate, paginationParams } from '@app/database';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CatalogoService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Products ──────────────────────────────────────────────────

  async create(dto: CreateProductDto, userId: string, role: string) {
    const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existing) throw new ConflictException(`Product with SKU '${dto.sku}' already exists`);

    let sellerId = dto.sellerId ?? null;

    if (role === 'SELLER') {
      const seller = await this.prisma.seller.findUnique({ where: { userId } });
      if (!seller) throw new ForbiddenException('You need an active seller profile to create products');
      sellerId = seller.id;
    }

    return this.prisma.product.create({ data: { ...dto, sellerId } });
  }

  async findAll(filter: FilterProductDto) {
    const { skip, take } = paginationParams(filter);
    const where: any = {};

    if (!filter.status) where.status = ProductStatus.ACTIVE;
    else where.status = filter.status;

    if (filter.sellerId) where.sellerId = filter.sellerId;
    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const allowedSort = ['name', 'price', 'createdAt', 'stock'];
    const sortBy = allowedSort.includes(filter.sortBy) ? filter.sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: filter.order ?? 'desc' },
        include: { seller: { select: { id: true, storeName: true } }, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);
    return paginate(data, total, filter.page ?? 1, take);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { id: true, storeName: true } }, category: true },
    });
    if (!product) throw new NotFoundException(`Product '${id}' not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId: string, role: string) {
    const product = await this.findOne(id);
    if (role === 'SELLER') {
      const seller = await this.prisma.seller.findUnique({ where: { userId } });
      if (!seller || product.sellerId !== seller.id)
        throw new ForbiddenException('You can only update your own products');
    }
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string, role: string) {
    const product = await this.findOne(id);
    if (role === 'SELLER') {
      const seller = await this.prisma.seller.findUnique({ where: { userId } });
      if (!seller || product.sellerId !== seller.id)
        throw new ForbiddenException('You can only remove your own products');
    }
    return this.prisma.product.update({ where: { id }, data: { status: ProductStatus.INACTIVE } });
  }

  // ─── Categories ─────────────────────────────────────────────────

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
    return this.prisma.category.create({ data: dto });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
  }

  async removeCategory(id: string) {
    const inUse = await this.prisma.product.count({ where: { categoryId: id } });
    if (inUse > 0) throw new ConflictException(`Category has ${inUse} products — reassign them first`);
    return this.prisma.category.delete({ where: { id } });
  }
}
