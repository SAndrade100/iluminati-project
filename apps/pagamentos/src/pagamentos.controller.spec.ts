import { Test, TestingModule } from '@nestjs/testing';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';

describe('PagamentosController', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentosController],
      providers: [{ provide: PagamentosService, useValue: {} }],
    }).compile();
    expect(module.get<PagamentosController>(PagamentosController)).toBeDefined();
  });
});

