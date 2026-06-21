import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ObservabilityModule } from '../../../libs/observability/src/index'

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
