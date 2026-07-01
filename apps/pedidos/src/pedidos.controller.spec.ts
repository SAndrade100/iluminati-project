import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

describe('PedidosController', () => {
  let pedidosController: PedidosController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [PedidosService],
    }).compile();

    pedidosController = app.get<PedidosController>(PedidosController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(pedidosController.getHello()).toBe('Hello World!');
    });
  });
});
