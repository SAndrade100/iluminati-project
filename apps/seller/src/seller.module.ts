import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { ObservabilityModule, HealthModule } from '@app/observability';
import { DatabaseModule } from '@app/database';
import { AuthCommonModule } from '@app/auth-common';

@Module({
  imports: [ObservabilityModule, DatabaseModule, AuthCommonModule, HealthModule],
  controllers: [SellerController],
  providers: [SellerService],
})
export class SellerModule {}
