import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { ObservabilityModule, HealthModule } from '@app/observability';
import { DatabaseModule } from '@app/database';
import { AuthCommonModule } from '@app/auth-common';
import { buildConfigModule, AUTH_ENV_SCHEMA } from '@app/config';

@Module({
  imports: [buildConfigModule(AUTH_ENV_SCHEMA), ObservabilityModule, DatabaseModule, AuthCommonModule, HealthModule],
  controllers: [CatalogoController],
  providers: [CatalogoService],
})
export class CatalogoModule {}
