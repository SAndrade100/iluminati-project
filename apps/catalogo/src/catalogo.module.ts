import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { ObservabilityModule } from '@app/observability';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [ObservabilityModule, DatabaseModule],
  controllers: [CatalogoController],
  providers: [CatalogoService],
})
export class CatalogoModule {}
