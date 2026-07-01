# 🔦 Iluminati Marketplace

Marketplace completo com foco em **segurança** e **observabilidade**, construído com arquitetura de microserviços usando NestJS 11 + Nuxt 3.

---

## Índice

- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar](#como-rodar)
  - [Opção A — Desenvolvimento Local](#opção-a--desenvolvimento-local-recomendado)
  - [Opção B — Docker (Produção)](#opção-b--docker-completo)
- [URLs e Portas](#urls-e-portas)
- [Banco de Dados](#banco-de-dados)
- [Observabilidade](#observabilidade)
- [Contas de Teste](#contas-de-teste)
- [Funcionalidades da API](#funcionalidades-da-api)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         Cliente                             │
│              Frontend Nuxt 3 (porta 3010)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP
┌─────────────────────────▼───────────────────────────────────┐
│               API Gateway (porta 3000)                      │
│   Proxy reverso · JWT Guard · Rate Limit · Swagger /docs    │
└──┬──────────┬──────────┬──────────┬──────────┬─────────────┘
   │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼
 Auth      Catálogo   Pedidos   Pagamentos  Seller
 :3002      :3001      :3003      :3004      :3005
   │          │          │          │          │
   └──────────┴──────────┴──────────┴──────────┘
                          │
              ┌───────────┼────────────┐
              ▼           ▼            ▼
          PostgreSQL    Redis       RabbitMQ
           :5433        :6379        :5672
```

Cada serviço NestJS publica e consome eventos via **RabbitMQ**. Toda a telemetria (traces, métricas, logs) é coletada pelo **OpenTelemetry Collector** e enviada para Jaeger, Prometheus e Loki.

---

## Tecnologias

| Camada | Stack |
|---|---|
| **Frontend** | Nuxt 3 · Vue 3 · Pinia · Tailwind CSS · vue-sonner |
| **Backend** | NestJS 11 · TypeScript · Fastify |
| **ORM** | Prisma 7 (driver `@prisma/adapter-pg`) |
| **Banco de Dados** | PostgreSQL 16 |
| **Cache / Rate Limit** | Redis 7 |
| **Mensageria** | RabbitMQ 3.13 |
| **Autenticação** | JWT (access 15min + refresh 7d) · bcrypt |
| **Validação** | class-validator · class-transformer · Joi |
| **Documentação** | Swagger / OpenAPI (`@nestjs/swagger`) |
| **Observabilidade** | OpenTelemetry · Jaeger · Prometheus · Loki · Grafana |
| **Containerização** | Docker · Docker Compose v2 |

---

## Estrutura do Projeto

```
iluminati-project/
├── apps/
│   ├── gateway/        # Proxy reverso — porta 3000
│   ├── auth/           # Autenticação + Endereços — porta 3002
│   ├── catalogo/       # Produtos + Categorias + Reviews — porta 3001
│   ├── pedidos/        # Pedidos + Carrinho + Cupons — porta 3003
│   ├── pagamentos/     # Pagamentos (mock) — porta 3004
│   ├── seller/         # Perfil do vendedor — porta 3005
│   └── web/            # Frontend Nuxt 3 — porta 3010
├── libs/
│   ├── database/       # PrismaService + tipos gerados + paginação
│   ├── auth-common/    # JwtStrategy · Guards · Decorators
│   ├── observability/  # MetricsService · HealthModule · OTel tracing
│   ├── events/         # Contratos de eventos RabbitMQ
│   └── config/         # buildConfigModule (Joi env validation)
├── prisma/
│   ├── schema.prisma   # Schema completo
│   ├── migrations/     # Migrations versionadas
│   └── seed.ts         # Dados de exemplo
├── infra/
│   ├── docker-compose.yml
│   ├── otel-collector-config.yaml
│   └── prometheus.yml
├── Dockerfile          # Multi-stage para apps NestJS
└── .env                # Variáveis de ambiente
```

---

## Pré-requisitos

- **Docker Desktop** ≥ 4.x (com pelo menos 4 GB de RAM alocados)
- **Node.js** ≥ 22
- **npm** ≥ 10

---

## Variáveis de Ambiente

Copie o `.env` de exemplo e ajuste se necessário:

```bash
# Banco de dados (Postgres mapeado na porta 5433 no Docker)
DATABASE_URL=postgresql://iluminati:iluminati_pass@localhost:5433/iluminati_db?schema=public

# JWT
JWT_ACCESS_SECRET=seu_secret_aqui
JWT_REFRESH_SECRET=seu_refresh_secret_aqui
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=iluminati_redis

# RabbitMQ
RABBITMQ_URL=amqp://iluminati:iluminati_rabbit@localhost:5672
RABBITMQ_USER=iluminati
RABBITMQ_PASS=iluminati_rabbit

# URLs internas dos serviços (usadas pelo gateway)
AUTH_SERVICE_URL=http://localhost:3002
CATALOGO_SERVICE_URL=http://localhost:3001
PEDIDOS_SERVICE_URL=http://localhost:3003
PAGAMENTOS_SERVICE_URL=http://localhost:3004
SELLER_SERVICE_URL=http://localhost:3005

# Frontend
NUXT_PUBLIC_API_URL=http://localhost:3000
```

> **Atenção:** O Postgres é mapeado para a porta **5433** (em vez de 5432) para evitar conflito com outras instâncias locais.

---

## Como Rodar

### Opção A — Desenvolvimento Local (recomendado)

Ideal para desenvolver e ver hot-reload nos serviços.

#### 1. Sobe a infraestrutura (Postgres, Redis, RabbitMQ)

```powershell
npm run infra:up
```

#### 2. Aplica migrations e seed (somente na primeira vez)

```powershell
npm run db:migrate
npm run db:seed
```

#### 3. Inicia os microserviços NestJS

Abra **6 terminais separados** e execute um em cada:

```powershell
npx nest start auth --watch
```
```powershell
npx nest start catalogo --watch
```
```powershell
npx nest start pedidos --watch
```
```powershell
npx nest start pagamentos --watch
```
```powershell
npx nest start seller --watch
```
```powershell
npx nest start gateway --watch
```

#### 4. Inicia o frontend

```powershell
npm run web:dev
```

---

### Opção B — Docker Completo

Sobe **tudo** em containers (infra + apps NestJS + frontend).

```powershell
# 1. Build e start de todos os containers
npm run infra:full

# 2. Migrations (somente na primeira vez ou após reset)
npm run db:migrate

# 3. Seed
npm run db:seed
```

> O primeiro `infra:full` é mais lento pois faz o build multi-stage de todos os apps.

---

## URLs e Portas

| Serviço | URL | Descrição |
|---|---|---|
| **Frontend** | http://localhost:3010 | Interface do marketplace |
| **Gateway** | http://localhost:3000 | Entry point da API |
| **Swagger (Gateway)** | http://localhost:3000/docs | Documentação completa |
| **Auth** | http://localhost:3002 | Autenticação e endereços |
| **Swagger (Auth)** | http://localhost:3002/docs | — |
| **Catálogo** | http://localhost:3001 | Produtos, categorias, reviews |
| **Pedidos** | http://localhost:3003 | Pedidos, carrinho, cupons |
| **Pagamentos** | http://localhost:3004 | Processamento de pagamentos |
| **Seller** | http://localhost:3005 | Perfil do vendedor |
| **Grafana** | http://localhost:3200 | Dashboards de observabilidade |
| **Prometheus** | http://localhost:9090 | Métricas |
| **Jaeger** | http://localhost:16686 | Distributed tracing |
| **RabbitMQ UI** | http://localhost:15672 | Gerenciamento de filas |
| **Prisma Studio** | http://localhost:5555 | Explorador do banco de dados |

---

## Banco de Dados

### Modelos principais

| Modelo | Descrição |
|---|---|
| `User` | Usuários com roles: `CUSTOMER`, `SELLER`, `ADMIN` |
| `Seller` | Perfil do vendedor (storeName, commissionRate, status) |
| `Product` | Produtos com SKU único, preço, estoque e categoria |
| `Category` | Categorias hierárquicas (parent/children) |
| `Cart` / `CartItem` | Carrinho de compras por usuário |
| `Order` / `OrderItem` | Pedidos com status e itens |
| `Payment` | Pagamento vinculado a pedido (mock 90% aprovação) |
| `Review` | Avaliações de produto (1–5 estrelas, única por usuário/produto) |
| `Coupon` | Cupons de desconto (percentual ou fixo, com expiração) |
| `Address` | Endereços de entrega do usuário |

### Comandos úteis

```powershell
# Aplicar migrations pendentes
npm run db:migrate

# Popular com dados de exemplo
npm run db:seed

# Resetar banco (apaga tudo e recria)
npm run db:reset

# Interface visual do banco
npm run db:studio
```

---

## Observabilidade

Toda a stack de observabilidade é configurada automaticamente via `npm run infra:full`.

| Ferramenta | Função | URL |
|---|---|---|
| **OpenTelemetry Collector** | Centraliza traces, métricas e logs | — |
| **Jaeger** | Traces distribuídos entre microserviços | http://localhost:16686 |
| **Prometheus** | Coleta e armazenamento de métricas | http://localhost:9090 |
| **Loki** | Agregação de logs estruturados | — |
| **Grafana** | Dashboard unificado | http://localhost:3200 `admin/admin` |
| **Alertmanager** | Roteamento de alertas | http://localhost:9093 |

---

## Contas de Teste

Criadas pelo `npm run db:seed`:

| E-mail | Senha | Role | Acesso |
|---|---|---|---|
| `admin@iluminati.dev` | `Admin@123` | ADMIN | Acesso total |
| `seller@iluminati.dev` | `Seller@123` | SELLER | Painel do vendedor |
| `customer1@iluminati.dev` | `Customer@123` | CUSTOMER | Comprador |
| `customer2@iluminati.dev` | `Customer@123` | CUSTOMER | Comprador |

**Dados do seed:** 8 produtos · 5 categorias · 3 cupons (`BEMVINDO10`, `FRETEGRATIS`, `BLACK20`) · 2 pedidos entregues · 2 reviews · 1 carrinho com itens.

---

## Funcionalidades da API

Todas as rotas abaixo são acessíveis via **Gateway** (`http://localhost:3000`).

### Autenticação
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | — | Registrar novo usuário |
| `POST` | `/auth/login` | — | Login (retorna access + refresh token) |
| `POST` | `/auth/refresh` | — | Renovar tokens |

### Produtos e Categorias
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/products` | — | Listar produtos (paginado, filtros) |
| `GET` | `/products/:id` | — | Detalhes do produto |
| `POST` | `/products` | SELLER | Criar produto |
| `PATCH` | `/products/:id` | SELLER | Atualizar produto |
| `DELETE` | `/products/:id` | SELLER | Remover produto |
| `GET` | `/categories` | — | Listar categorias (árvore) |
| `POST` | `/categories` | ADMIN | Criar categoria |

### Reviews
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/products/:id/reviews` | CUSTOMER | Criar avaliação |
| `GET` | `/products/:id/reviews` | — | Listar avaliações do produto |
| `GET` | `/reviews/mine` | CUSTOMER | Minhas avaliações |
| `DELETE` | `/reviews/:id` | CUSTOMER | Remover avaliação |

### Carrinho
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/cart` | CUSTOMER | Ver carrinho |
| `POST` | `/cart/items` | CUSTOMER | Adicionar item |
| `PATCH` | `/cart/items/:id` | CUSTOMER | Atualizar quantidade |
| `DELETE` | `/cart/items/:id` | CUSTOMER | Remover item |
| `POST` | `/cart/checkout` | CUSTOMER | Finalizar compra |

### Pedidos
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/orders` | CUSTOMER | Meus pedidos |
| `GET` | `/orders/:id` | CUSTOMER | Detalhes do pedido |

### Cupons
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/coupons` | ADMIN | Criar cupom |
| `GET` | `/coupons` | ADMIN | Listar cupons |
| `GET` | `/coupons/:code/validate` | — | Validar cupom |
| `PATCH` | `/coupons/:id/activate` | ADMIN | Ativar cupom |
| `PATCH` | `/coupons/:id/deactivate` | ADMIN | Desativar cupom |

### Endereços
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/addresses` | AUTH | Listar endereços |
| `POST` | `/addresses` | AUTH | Criar endereço |
| `PATCH` | `/addresses/:id` | AUTH | Atualizar endereço |
| `PUT` | `/addresses/:id/default` | AUTH | Definir como padrão |
| `DELETE` | `/addresses/:id` | AUTH | Remover endereço |

---

## Scripts Disponíveis

```powershell
# Infraestrutura
npm run infra:up        # Sobe Postgres + Redis + RabbitMQ
npm run infra:full      # Sobe toda a stack (infra + apps + frontend)
npm run infra:down      # Para todos os containers

# Banco de dados
npm run db:migrate      # Aplica migrations pendentes
npm run db:seed         # Popula com dados de exemplo
npm run db:reset        # Reseta e recria o banco
npm run db:studio       # Abre Prisma Studio (porta 5555)

# Frontend
npm run web:dev         # Inicia Nuxt em modo dev (porta 3010)
npm run web:build       # Build de produção do frontend

# Apps NestJS (modo dev com hot-reload)
npx nest start auth --watch
npx nest start catalogo --watch
npx nest start pedidos --watch
npx nest start pagamentos --watch
npx nest start seller --watch
npx nest start gateway --watch
```

---

## Observações

- **Pagamentos:** processamento é simulado com 90% de taxa de aprovação.
- **Imagens de produto:** não há upload de imagens; placeholder exibido no frontend.
- **Refresh token:** não há blacklist por revogação — o token expira naturalmente em 7 dias.
- **PostgreSQL na porta 5433:** mapeado assim para evitar conflito com outras instâncias locais na 5432.

---

## Licença

MIT

---

*Feito com NestJS 11 · Nuxt 3 · Prisma 7 · Docker*