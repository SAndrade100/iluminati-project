import { Test, TestingModule } from '@nestjs/testing';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';

describe('PagamentosController', () => {
  let pagamentosController: PagamentosController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PagamentosController],
      providers: [PagamentosService],
    }).compile();

    pagamentosController = app.get<PagamentosController>(PagamentosController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(pagamentosController.getHello()).toBe('Hello World!');
    });
  });
});
