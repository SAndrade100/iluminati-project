import { Controller, Get, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { Public, Roles } from '@app/auth-common';

@Controller('payments')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'pagamentos' };
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.pagamentosService.findByOrder(orderId);
  }

  @Post('order/:orderId/process')
  @HttpCode(HttpStatus.OK)
  process(@Param('orderId') orderId: string) {
    return this.pagamentosService.process(orderId);
  }

  @Post('order/:orderId/refund')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  refund(@Param('orderId') orderId: string) {
    return this.pagamentosService.refund(orderId);
  }
}
