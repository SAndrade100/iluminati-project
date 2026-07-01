import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ObservabilityModule } from '@app/observability';
import { AuthCommonModule, JwtAuthGuard, RolesGuard } from '@app/auth-common';
import { ThrottlerRedisStorage } from './throttler-redis.storage';

@Module({
  imports: [
    ObservabilityModule,
    AuthCommonModule,
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'short', ttl: 1000, limit: 20 },
        { name: 'long', ttl: 60_000, limit: 500 },
      ],
      storage: new ThrottlerRedisStorage(),
    }),
  ],
  controllers: [GatewayController],
  providers: [
    GatewayService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class GatewayModule {}
