export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  totalPrice: number;
  paymentId: string;
  paymentMethod: string;
}

export interface PaymentProcessedEvent {
  orderId: string;
  paymentId: string;
  status: 'APPROVED' | 'REFUSED';
  externalRef: string | null;
}
