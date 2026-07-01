import { Test, TestingModule } from '@nestjs/testing';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

describe('CatalogoController', () => {
  it('should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogoController],
      providers: [{ provide: CatalogoService, useValue: {} }],
    }).compile();
    expect(module.get<CatalogoController>(CatalogoController)).toBeDefined();
  });
});
