import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ObservabilityModule, HealthModule } from '@app/observability';
import { DatabaseModule } from '@app/database';
import { buildConfigModule, AUTH_ENV_SCHEMA } from '@app/config';

@Module({
  imports: [
    buildConfigModule(AUTH_ENV_SCHEMA),
    ObservabilityModule,
    DatabaseModule,
    HealthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
