import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Req, HttpCode, HttpStatus,
  All,
} from '@nestjs/common';
import { Request } from 'express';
import { GatewayService } from './gateway.service';
import { Public, CurrentUser, CurrentUserData } from '@app/auth-common';

const CATALOGO_URL = process.env.CATALOGO_SERVICE_URL ?? 'http://localhost:3001';
const PEDIDOS_URL = process.env.PEDIDOS_SERVICE_URL ?? 'http://localhost:3003';
const PAGAMENTOS_URL = process.env.PAGAMENTOS_SERVICE_URL ?? 'http://localhost:3004';
const AUTH_URL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002';

@Controller()
export class GatewayController {
  constructor(private readonly gatewaySvc: GatewayService) {}

  // ─── Health ───────────────────────────────────────────────
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'gateway' };
  }

  // ─── Auth (public) ────────────────────────────────────────
  @Public()
  @Post('auth/register')
  register(@Body() body: unknown) {
    return this.gatewaySvc.forward(AUTH_URL, 'POST', '/auth/register', body);
  }

  @Public()
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: unknown) {
    return this.gatewaySvc.forward(AUTH_URL, 'POST', '/auth/login', body);
  }

  @Public()
  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: unknown) {
    return this.gatewaySvc.forward(AUTH_URL, 'POST', '/auth/refresh', body);
  }

  // ─── Catálogo ─────────────────────────────────────────────
  @Public()
  @Get('products')
  getProducts(@Query() query: Record<string, string>) {
    const qs = new URLSearchParams(query).toString();
    return this.gatewaySvc.forward(CATALOGO_URL, 'GET', `/products${qs ? `?${qs}` : ''}`);
  }

  @Public()
  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'GET', `/products/${id}`);
  }

  @Post('products')
  createProduct(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'POST', '/products', body, this.authHeader(req));
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'PATCH', `/products/${id}`, body, this.authHeader(req));
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProduct(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'DELETE', `/products/${id}`, undefined, this.authHeader(req));
  }

  // ─── Pedidos ──────────────────────────────────────────────
  @Post('orders')
  createOrder(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'POST', '/orders', body, this.authHeader(req));
  }

  @Get('orders')
  getOrders(@Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'GET', '/orders', undefined, this.authHeader(req));
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'GET', `/orders/${id}`, undefined, this.authHeader(req));
  }

  @Delete('orders/:id')
  cancelOrder(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'DELETE', `/orders/${id}`, undefined, this.authHeader(req));
  }

  // ─── Pagamentos ───────────────────────────────────────────
  @Get('payments/order/:orderId')
  getPayment(@Param('orderId') orderId: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PAGAMENTOS_URL, 'GET', `/payments/order/${orderId}`, undefined, this.authHeader(req));
  }

  @Post('payments/order/:orderId/process')
  @HttpCode(HttpStatus.OK)
  processPayment(@Param('orderId') orderId: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PAGAMENTOS_URL, 'POST', `/payments/order/${orderId}/process`, undefined, this.authHeader(req));
  }

  @Post('payments/order/:orderId/refund')
  @HttpCode(HttpStatus.OK)
  refundPayment(@Param('orderId') orderId: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PAGAMENTOS_URL, 'POST', `/payments/order/${orderId}/refund`, undefined, this.authHeader(req));
  }

  // ─── Helper ───────────────────────────────────────────────
  private authHeader(req: Request): Record<string, string> {
    const auth = req.headers['authorization'];
    return auth ? { authorization: auth } : {};
  }
}
