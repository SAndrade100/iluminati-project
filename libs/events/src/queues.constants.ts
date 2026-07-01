/** Nomes das queues RabbitMQ — usados por publishers e consumers */
export const QUEUES = {
  PEDIDOS: 'iluminati.pedidos',
  PAGAMENTOS: 'iluminati.pagamentos',
} as const;

/** Padrões de evento roteados pelas queues */
export const EVENTS = {
  ORDER_CREATED: 'order.created',
  PAYMENT_PROCESSED: 'payment.processed',
} as const;
