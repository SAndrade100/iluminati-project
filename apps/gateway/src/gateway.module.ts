import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ObservabilityModule, HealthModule } from '@app/observability';
import { AuthCommonModule, JwtAuthGuard, RolesGuard } from '@app/auth-common';
import { DatabaseModule } from '@app/database';
import { ThrottlerRedisStorage } from './throttler-redis.storage';
import { buildConfigModule, AUTH_ENV_SCHEMA, REDIS_ENV_SCHEMA } from '@app/config';

@Module({
  imports: [
    buildConfigModule({ ...AUTH_ENV_SCHEMA, ...REDIS_ENV_SCHEMA }),
    ObservabilityModule,
    AuthCommonModule,
    DatabaseModule,
    HealthModule,
    HttpModule.register({ timeout: 10_000 }),
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
