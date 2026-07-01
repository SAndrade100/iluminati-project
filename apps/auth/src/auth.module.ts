import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AddressController } from './addresses/address.controller';
import { AddressService } from './addresses/address.service';
import { ObservabilityModule, HealthModule } from '@app/observability';
import { DatabaseModule } from '@app/database';
import { AuthCommonModule, JwtAuthGuard } from '@app/auth-common';
import { buildConfigModule, AUTH_ENV_SCHEMA } from '@app/config';

@Module({
  imports: [
    buildConfigModule(AUTH_ENV_SCHEMA),
    ObservabilityModule,
    DatabaseModule,
    HealthModule,
    AuthCommonModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController, AddressController],
  providers: [
    AuthService,
    JwtStrategy,
    AddressService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
