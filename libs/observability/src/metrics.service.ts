import { Injectable } from '@nestjs/common';
import { metrics, Attributes } from '@opentelemetry/api';

@Injectable()
export class MetricsService {
  private readonly meter = metrics.getMeter('iluminati', '1.0.0');

  // ─── Auth ───────────────────────────────────────────────
  private readonly authRegistrations = this.meter.createCounter('auth.registrations.total', {
    description: 'Total user registrations',
  });

  private readonly authLogins = this.meter.createCounter('auth.logins.total', {
    description: 'Total login attempts by result',
  });

  // ─── Orders ─────────────────────────────────────────────
  private readonly ordersCreated = this.meter.createCounter('orders.created.total', {
    description: 'Total orders created',
  });

  private readonly ordersCancelled = this.meter.createCounter('orders.cancelled.total', {
    description: 'Total orders cancelled',
  });

  private readonly orderValue = this.meter.createHistogram('orders.value', {
    description: 'Distribution of order values in BRL',
    unit: 'BRL',
    advice: { explicitBucketBoundaries: [10, 50, 100, 250, 500, 1000, 2500, 5000] },
  });

  // ─── Payments ───────────────────────────────────────────
  private readonly paymentsProcessed = this.meter.createCounter('payments.processed.total', {
    description: 'Total payments processed by status',
  });

  // ─── HTTP ────────────────────────────────────────────────
  private readonly httpRequestDuration = this.meter.createHistogram('http.request.duration', {
    description: 'HTTP request duration in milliseconds',
    unit: 'ms',
    advice: { explicitBucketBoundaries: [10, 50, 100, 250, 500, 1000, 2000, 5000] },
  });

  // ─── Public API ─────────────────────────────────────────

  recordRegistration() {
    this.authRegistrations.add(1);
  }

  recordLogin(success: boolean) {
    this.authLogins.add(1, { success: String(success) });
  }

  recordOrderCreated(totalPrice: number) {
    this.ordersCreated.add(1);
    this.orderValue.record(totalPrice);
  }

  recordOrderCancelled() {
    this.ordersCancelled.add(1);
  }

  recordPaymentProcessed(status: 'APPROVED' | 'REFUSED' | 'REFUNDED', method?: string) {
    const attrs: Attributes = { status };
    if (method) attrs['method'] = method;
    this.paymentsProcessed.add(1, attrs);
  }

  recordHttpRequest(method: string, route: string, statusCode: number, durationMs: number) {
    this.httpRequestDuration.record(durationMs, {
      method,
      route,
      status_code: String(statusCode),
    });
  }
}
