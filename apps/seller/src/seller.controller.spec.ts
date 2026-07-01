import { Test, TestingModule } from '@nestjs/testing';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';

describe('SellerController', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerController],
      providers: [{ provide: SellerService, useValue: {} }],
    }).compile();
    expect(module.get<SellerController>(SellerController)).toBeDefined();
  });
});

