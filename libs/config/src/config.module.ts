import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Schema base de variáveis de ambiente obrigatórias para todos os apps.
 * Cada app pode extender com `extraValidation`.
 */
export const BASE_ENV_SCHEMA = {
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
};

export const AUTH_ENV_SCHEMA = {
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
};

export const REDIS_ENV_SCHEMA = {
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
};

export const RABBITMQ_ENV_SCHEMA = {
  RABBITMQ_URL: Joi.string().default('amqp://iluminati:iluminati_rabbit@localhost:5672'),
};

/** Cria um ConfigModule com validação Joi para as chaves fornecidas. */
export function buildConfigModule(extraSchema: Record<string, Joi.Schema> = {}) {
  return ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: Joi.object({ ...BASE_ENV_SCHEMA, ...extraSchema }),
    validationOptions: { allowUnknown: true, abortEarly: false },
  });
}
