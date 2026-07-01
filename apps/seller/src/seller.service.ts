import {
  Injectable, ConflictException, NotFoundException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService, SellerStatus } from '@app/database';
import { paginate, paginationParams, PageQueryDto } from '@app/database';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellerService {
  private readonly logger = new Logger(SellerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async apply(userId: string, dto: ApplySellerDto) {
    const existing = await this.prisma.seller.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Seller profile already exists');

    const nameConflict = await this.prisma.seller.findUnique({ where: { storeName: dto.storeName } });
    if (nameConflict) throw new ConflictException(`Store name '${dto.storeName}' is already taken`);

    const seller = await this.prisma.seller.create({
      data: { userId, storeName: dto.storeName, description: dto.description },
    });
    this.logger.log(`Seller application: ${seller.storeName} (userId: ${userId})`);
    return seller;
  }

  async findAll(query: PageQueryDto) {
    const { skip, take } = paginationParams(query);
    const [data, total] = await Promise.all([
      this.prisma.seller.findMany({
        where: { status: SellerStatus.ACTIVE },
        skip,
        take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.order ?? 'desc' },
        select: { id: true, storeName: true, description: true, createdAt: true },
      }),
      this.prisma.seller.count({ where: { status: SellerStatus.ACTIVE } }),
    ]);
    return paginate(data, total, query.page ?? 1, take);
  }

  async findOne(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      select: { id: true, storeName: true, description: true, status: true, createdAt: true },
    });
    if (!seller) throw new NotFoundException(`Seller '${id}' not found`);
    return seller;
  }

  async findMine(userId: string) {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) throw new NotFoundException('You do not have a seller profile');
    return seller;
  }

  async updateMine(userId: string, dto: UpdateSellerDto) {
    const seller = await this.findMine(userId);
    if (dto.storeName && dto.storeName !== seller.storeName) {
      const conflict = await this.prisma.seller.findUnique({ where: { storeName: dto.storeName } });
      if (conflict) throw new ConflictException(`Store name '${dto.storeName}' is already taken`);
    }
    return this.prisma.seller.update({ where: { userId }, data: dto });
  }

  async approve(id: string) {
    const seller = await this.findOne(id);
    if (seller.status === SellerStatus.ACTIVE)
      throw new ConflictException('Seller is already active');

    const updated = await this.prisma.$transaction(async (tx) => {
      const s = await tx.seller.update({ where: { id }, data: { status: SellerStatus.ACTIVE } });
      await tx.user.update({ where: { id: (await tx.seller.findUnique({ where: { id } })).userId }, data: { role: 'SELLER' } });
      return s;
    });
    this.logger.log(`Seller approved: ${updated.storeName}`);
    return updated;
  }

  async suspend(id: string) {
    await this.findOne(id);
    return this.prisma.seller.update({ where: { id }, data: { status: SellerStatus.SUSPENDED } });
  }

  async findAllAdmin(query: PageQueryDto) {
    const { skip, take } = paginationParams(query);
    const [data, total] = await Promise.all([
      this.prisma.seller.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.seller.count(),
    ]);
    return paginate(data, total, query.page ?? 1, take);
  }
}
