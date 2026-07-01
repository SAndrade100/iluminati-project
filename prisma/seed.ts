/**
 * Seed do banco de dados — dados de exemplo para desenvolvimento
 * Execução: npx ts-node prisma/seed.ts   (ou via npm run db:seed)
 */
import 'dotenv/config';
import { PrismaClient } from '../libs/database/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Limpa dados existentes (ordem inversa de dependência) ─────────────────
  await prisma.couponUsage.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();

  const SALT = 12;

  // ─── Usuários ──────────────────────────────────────────────────────────────
  const [admin, seller1User, customer1, customer2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@iluminati.dev',
        name: 'Admin Master',
        password: await bcrypt.hash('Admin@123', SALT),
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        email: 'seller@iluminati.dev',
        name: 'João Vendedor',
        password: await bcrypt.hash('Seller@123', SALT),
        role: 'SELLER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'customer1@iluminati.dev',
        name: 'Maria Cliente',
        password: await bcrypt.hash('Customer@123', SALT),
        role: 'CUSTOMER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'customer2@iluminati.dev',
        name: 'Pedro Comprador',
        password: await bcrypt.hash('Customer@123', SALT),
        role: 'CUSTOMER',
      },
    }),
  ]);

  console.log('✅ Users created');

  // ─── Seller ────────────────────────────────────────────────────────────────
  const seller = await prisma.seller.create({
    data: {
      userId: seller1User.id,
      storeName: 'Tech Store Premium',
      description: 'Os melhores produtos de tecnologia com garantia estendida.',
      commissionRate: 8,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seller created');

  // ─── Categorias ────────────────────────────────────────────────────────────
  const [catEletronicos, catModa, catCasa] = await Promise.all([
    prisma.category.create({ data: { name: 'Eletrônicos', slug: 'eletronicos' } }),
    prisma.category.create({ data: { name: 'Moda', slug: 'moda' } }),
    prisma.category.create({ data: { name: 'Casa & Jardim', slug: 'casa-jardim' } }),
  ]);

  const [catSmartphones, catNotebooks] = await Promise.all([
    prisma.category.create({ data: { name: 'Smartphones', slug: 'smartphones', parentId: catEletronicos.id } }),
    prisma.category.create({ data: { name: 'Notebooks', slug: 'notebooks', parentId: catEletronicos.id } }),
  ]);

  console.log('✅ Categories created');

  // ─── Produtos ──────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catSmartphones.id,
        name: 'iPhone 15 Pro 256GB',
        description: 'O iPhone mais avançado já criado. Chip A17 Pro, câmera de 48MP e titanium.',
        price: 7999.90,
        stock: 15,
        sku: 'IPHONE-15-PRO-256',
        status: 'ACTIVE',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catSmartphones.id,
        name: 'Samsung Galaxy S24 Ultra 512GB',
        description: 'Galaxy AI, câmera de 200MP e S Pen integrada. O smartphone definitivo.',
        price: 6499.00,
        stock: 20,
        sku: 'SAMSUNG-S24-ULTRA-512',
        status: 'ACTIVE',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catNotebooks.id,
        name: 'MacBook Air M3 13" 16GB',
        description: 'Ultrafino, silencioso e incrivelmente rápido. Chip M3 com GPU de 10 núcleos.',
        price: 11999.00,
        stock: 8,
        sku: 'MACBOOK-AIR-M3-16GB',
        status: 'ACTIVE',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catNotebooks.id,
        name: 'Dell XPS 15 i7 32GB RTX 4060',
        description: 'Notebook premium para criadores de conteúdo e gamers exigentes.',
        price: 9499.00,
        stock: 5,
        sku: 'DELL-XPS15-I7-32GB',
        status: 'ACTIVE',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catEletronicos.id,
        name: 'AirPods Pro 2ª Geração',
        description: 'Cancelamento de ruído ativo de última geração com chip H2.',
        price: 1799.00,
        stock: 30,
        sku: 'AIRPODS-PRO-2GEN',
        status: 'ACTIVE',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catModa.id,
        name: 'Tênis Nike Air Max 270 Preto 42',
        description: 'O maior Air da Nike com câmara de ar máxima no calcanhar.',
        price: 699.90,
        stock: 12,
        sku: 'NIKE-AIRMAX270-BLK-42',
        status: 'ACTIVE',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catCasa.id,
        name: 'Cafeteira Nespresso Vertuo Next',
        description: 'Tecnologia Centrifusion para o café perfeito em qualquer tamanho.',
        price: 499.90,
        stock: 25,
        sku: 'NESPRESSO-VERTUO-NEXT',
        status: 'ACTIVE',
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: catSmartphones.id,
        name: 'Motorola Edge 50 Pro 256GB',
        description: 'Câmera Pantone, tela pOLED 165Hz e carregamento turbo de 125W.',
        price: 2799.00,
        stock: 18,
        sku: 'MOTO-EDGE50PRO-256',
        status: 'OUT_OF_STOCK',
      },
    }),
  ]);

  console.log('✅ Products created');

  // ─── Endereços ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.address.create({
      data: {
        userId: customer1.id,
        label: 'HOME',
        street: 'Rua das Palmeiras',
        number: '123',
        complement: 'Apto 12',
        neighborhood: 'Jardim Europa',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01452-001',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        userId: customer2.id,
        label: 'HOME',
        street: 'Av. Atlântica',
        number: '2000',
        neighborhood: 'Copacabana',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '22041-001',
        isDefault: true,
      },
    }),
  ]);

  console.log('✅ Addresses created');

  // ─── Cupons ────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'BEMVINDO10',
        description: '10% de desconto na primeira compra',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 100,
        maxUses: 500,
        isActive: true,
        expiresAt: new Date('2026-12-31'),
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'FRETEGRATIS',
        description: 'R$ 50 de desconto em compras acima de R$ 500',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderValue: 500,
        isActive: true,
        expiresAt: new Date('2026-09-30'),
      },
    }),
    prisma.coupon.create({
      data: {
        code: 'BLACK20',
        description: 'Black Friday — 20% de desconto',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 300,
        maxUses: 1000,
        isActive: false, // inativo de propósito para exemplo
      },
    }),
  ]);

  console.log('✅ Coupons created');

  // ─── Pedido + Reviews de exemplo ──────────────────────────────────────────
  const order = await prisma.order.create({
    data: {
      userId: customer1.id,
      totalPrice: 1799.00,
      status: 'DELIVERED',
      items: {
        create: [{
          productId: products[4].id, // AirPods Pro
          quantity: 1,
          unitPrice: 1799.00,
        }],
      },
      payment: {
        create: {
          method: 'PIX',
          status: 'APPROVED',
          amountPaid: 1799.00,
          processedAt: new Date(),
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      userId: customer1.id,
      productId: products[4].id, // AirPods Pro
      orderId: order.id,
      rating: 5,
      comment: 'Cancelamento de ruído incrível, vale muito o investimento! Uso no dia a dia no metrô.',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: customer2.id,
      totalPrice: 7999.90,
      status: 'CONFIRMED',
      items: {
        create: [{
          productId: products[0].id, // iPhone 15 Pro
          quantity: 1,
          unitPrice: 7999.90,
        }],
      },
      payment: {
        create: {
          method: 'CREDIT_CARD',
          status: 'APPROVED',
          amountPaid: 7999.90,
          processedAt: new Date(),
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      userId: customer2.id,
      productId: products[0].id, // iPhone 15 Pro
      orderId: order2.id,
      rating: 4,
      comment: 'Câmera excelente e desempenho absurdo. Único ponto negativo é a bateria que poderia durar mais.',
    },
  });

  console.log('✅ Orders & reviews created');

  // ─── Carrinho com itens ────────────────────────────────────────────────────
  const cart = await prisma.cart.create({ data: { userId: customer1.id } });
  await prisma.cartItem.createMany({
    data: [
      { cartId: cart.id, productId: products[1].id, quantity: 1 }, // Galaxy S24
      { cartId: cart.id, productId: products[6].id, quantity: 2 }, // Cafeteira
    ],
  });

  console.log('✅ Cart with items created');

  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Contas criadas:');
  console.log('   admin@iluminati.dev    | Admin@123  | role: ADMIN');
  console.log('   seller@iluminati.dev   | Seller@123 | role: SELLER');
  console.log('   customer1@iluminati.dev| Customer@123| role: CUSTOMER');
  console.log('   customer2@iluminati.dev| Customer@123| role: CUSTOMER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎟️  Cupons ativos: BEMVINDO10 (10%), FRETEGRATIS (R$50)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
