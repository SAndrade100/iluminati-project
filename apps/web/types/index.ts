// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN'
  createdAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// ─── Product / Catalog ───────────────────────────────────────────────────────

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'

export interface Category {
  id: string
  name: string
  slug: string
  parentId?: string
  children?: Category[]
}

export interface Seller {
  id: string
  userId: string
  storeName: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
  commissionRate: number
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  sku: string
  status: ProductStatus
  categoryId?: string
  sellerId?: string
  category?: Category
  seller?: Seller
  createdAt: string
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  productId: string
  quantity: number
  product: Product
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'DELIVERED'
export type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO'
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REFUSED' | 'REFUNDED'

export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  status: PaymentStatus
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  product: Product
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalPrice: number
  discountAmount?: number
  couponId?: string
  items: OrderItem[]
  payment?: Payment
  createdAt: string
}

// ─── Address ─────────────────────────────────────────────────────────────────

export type AddressLabel = 'HOME' | 'WORK' | 'OTHER'

export interface Address {
  id: string
  userId: string
  label: AddressLabel
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  userId: string
  productId: string
  orderId?: string
  rating: number
  comment?: string
  createdAt: string
  user?: Pick<User, 'id' | 'name' | 'email'>
}

export interface ReviewStats {
  average: number
  total: number
  reviews: Review[]
}

// ─── Coupon ──────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string
  code: string
  description?: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minOrderValue?: number
  isActive: boolean
  expiresAt?: string
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number
  page: number
  lastPage: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}
