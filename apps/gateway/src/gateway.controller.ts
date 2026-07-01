import {
  Controller, Get, Post, Patch, Delete, Put,
  Param, Body, Query, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { GatewayService } from './gateway.service';
import { Public, CurrentUser, CurrentUserData } from '@app/auth-common';

const CATALOGO_URL = process.env.CATALOGO_SERVICE_URL ?? 'http://localhost:3001';
const PEDIDOS_URL  = process.env.PEDIDOS_SERVICE_URL  ?? 'http://localhost:3003';
const PAGAMENTOS_URL = process.env.PAGAMENTOS_SERVICE_URL ?? 'http://localhost:3004';
const AUTH_URL     = process.env.AUTH_SERVICE_URL     ?? 'http://localhost:3002';
const SELLER_URL   = process.env.SELLER_SERVICE_URL   ?? 'http://localhost:3005';

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

  // ─── Sellers ──────────────────────────────────────────────
  @Post('sellers/apply')
  applyAsSeller(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(SELLER_URL, 'POST', '/sellers/apply', body, this.authHeader(req));
  }

  @Get('sellers/me')
  getMySellerProfile(@Req() req: Request) {
    return this.gatewaySvc.forward(SELLER_URL, 'GET', '/sellers/me', undefined, this.authHeader(req));
  }

  @Patch('sellers/me')
  updateMySellerProfile(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(SELLER_URL, 'PATCH', '/sellers/me', body, this.authHeader(req));
  }

  @Get('sellers/admin')
  getSellersAdmin(@Query() query: Record<string, string>, @Req() req: Request) {
    const qs = new URLSearchParams(query).toString();
    return this.gatewaySvc.forward(SELLER_URL, 'GET', `/sellers/admin${qs ? `?${qs}` : ''}`, undefined, this.authHeader(req));
  }

  @Put('sellers/:id/approve')
  @HttpCode(HttpStatus.OK)
  approveSeller(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(SELLER_URL, 'PUT', `/sellers/${id}/approve`, undefined, this.authHeader(req));
  }

  @Put('sellers/:id/suspend')
  @HttpCode(HttpStatus.OK)
  suspendSeller(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(SELLER_URL, 'PUT', `/sellers/${id}/suspend`, undefined, this.authHeader(req));
  }

  @Public()
  @Get('sellers')
  getSellers(@Query() query: Record<string, string>) {
    const qs = new URLSearchParams(query).toString();
    return this.gatewaySvc.forward(SELLER_URL, 'GET', `/sellers${qs ? `?${qs}` : ''}`);
  }

  @Public()
  @Get('sellers/:id')
  getSeller(@Param('id') id: string) {
    return this.gatewaySvc.forward(SELLER_URL, 'GET', `/sellers/${id}`);
  }

  // ─── Categories ───────────────────────────────────────────
  @Public()
  @Get('categories')
  getCategories() {
    return this.gatewaySvc.forward(CATALOGO_URL, 'GET', '/categories');
  }

  @Post('categories')
  createCategory(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'POST', '/categories', body, this.authHeader(req));
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'DELETE', `/categories/${id}`, undefined, this.authHeader(req));
  }

  // ─── Cart ─────────────────────────────────────────────────
  @Get('cart')
  getCart(@Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'GET', '/cart', undefined, this.authHeader(req));
  }

  @Post('cart/items')
  addCartItem(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'POST', '/cart/items', body, this.authHeader(req));
  }

  @Patch('cart/items/:productId')
  updateCartItem(@Param('productId') productId: string, @Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'PATCH', `/cart/items/${productId}`, body, this.authHeader(req));
  }

  @Delete('cart/items/:productId')
  removeCartItem(@Param('productId') productId: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'DELETE', `/cart/items/${productId}`, undefined, this.authHeader(req));
  }

  @Delete('cart')
  @HttpCode(HttpStatus.OK)
  clearCart(@Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'DELETE', '/cart', undefined, this.authHeader(req));
  }

  @Post('cart/checkout')
  @HttpCode(HttpStatus.CREATED)
  checkout(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'POST', '/cart/checkout', body, this.authHeader(req));
  }

  // ─── Helper ───────────────────────────────────────────────
  private authHeader(req: Request): Record<string, string> {
    const auth = req.headers['authorization'];
    return auth ? { authorization: auth } : {};
  }

  // ─── Reviews ──────────────────────────────────────────────
  @Post('products/:id/reviews')
  createReview(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'POST', `/products/${id}/reviews`, body, this.authHeader(req));
  }

  @Public()
  @Get('products/:id/reviews')
  getProductReviews(@Param('id') id: string) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'GET', `/products/${id}/reviews`);
  }

  @Get('reviews/mine')
  getMyReviews(@Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'GET', '/reviews/mine', undefined, this.authHeader(req));
  }

  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReview(@Param('reviewId') reviewId: string, @Req() req: Request) {
    return this.gatewaySvc.forward(CATALOGO_URL, 'DELETE', `/reviews/${reviewId}`, undefined, this.authHeader(req));
  }

  // ─── Coupons ──────────────────────────────────────────────
  @Post('coupons')
  createCoupon(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'POST', '/coupons', body, this.authHeader(req));
  }

  @Get('coupons')
  getCoupons(@Query() query: Record<string, string>, @Req() req: Request) {
    const qs = new URLSearchParams(query).toString();
    return this.gatewaySvc.forward(PEDIDOS_URL, 'GET', `/coupons${qs ? `?${qs}` : ''}`, undefined, this.authHeader(req));
  }

  @Public()
  @Get('coupons/:code/validate')
  validateCoupon(@Param('code') code: string, @Query('subtotal') subtotal: string) {
    const qs = subtotal ? `?subtotal=${subtotal}` : '';
    return this.gatewaySvc.forward(PEDIDOS_URL, 'GET', `/coupons/${code}/validate${qs}`);
  }

  @Patch('coupons/:id/activate')
  @HttpCode(HttpStatus.OK)
  activateCoupon(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'PATCH', `/coupons/${id}/activate`, undefined, this.authHeader(req));
  }

  @Patch('coupons/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  deactivateCoupon(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(PEDIDOS_URL, 'PATCH', `/coupons/${id}/deactivate`, undefined, this.authHeader(req));
  }

  // ─── Addresses ────────────────────────────────────────────
  @Get('addresses')
  getAddresses(@Req() req: Request) {
    return this.gatewaySvc.forward(AUTH_URL, 'GET', '/addresses', undefined, this.authHeader(req));
  }

  @Post('addresses')
  createAddress(@Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(AUTH_URL, 'POST', '/addresses', body, this.authHeader(req));
  }

  @Patch('addresses/:id')
  updateAddress(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    return this.gatewaySvc.forward(AUTH_URL, 'PATCH', `/addresses/${id}`, body, this.authHeader(req));
  }

  @Put('addresses/:id/default')
  @HttpCode(HttpStatus.OK)
  setDefaultAddress(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(AUTH_URL, 'PUT', `/addresses/${id}/default`, undefined, this.authHeader(req));
  }

  @Delete('addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAddress(@Param('id') id: string, @Req() req: Request) {
    return this.gatewaySvc.forward(AUTH_URL, 'DELETE', `/addresses/${id}`, undefined, this.authHeader(req));
  }
}
