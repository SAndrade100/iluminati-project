import { Controller, Get } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Public } from '@app/auth-common';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'gateway' };
  }
}
