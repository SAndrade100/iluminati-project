import { Controller, Get, Post, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PagamentosService } from './pagamentos.service';
import { Public, Roles } from '@app/auth-common';

@ApiTags('payments')
@ApiBearerAuth('access-token')
@Controller('payments')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'pagamentos' };
  }

  @ApiOperation({ summary: 'Consultar pagamento de um pedido' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.pagamentosService.findByOrder(orderId);
  }

  @ApiOperation({ summary: 'Processar pagamento manualmente (mock)' })
  @ApiResponse({ status: 200, description: 'APPROVED ou REFUSED (90%/10%)' })
  @Post('order/:orderId/process')
  @HttpCode(HttpStatus.OK)
  process(@Param('orderId') orderId: string) {
    return this.pagamentosService.process(orderId);
  }

  @ApiOperation({ summary: '[ADMIN] Reembolsar pagamento aprovado' })
  @ApiResponse({ status: 400, description: 'Pagamento não está APPROVED' })
  @Post('order/:orderId/refund')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  refund(@Param('orderId') orderId: string) {
    return this.pagamentosService.refund(orderId);
  }
}
