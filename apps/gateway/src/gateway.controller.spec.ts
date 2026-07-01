import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

describe('GatewayController', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [{ provide: GatewayService, useValue: {} }],
    }).compile();
    expect(module.get<GatewayController>(GatewayController)).toBeDefined();
  });
});
