export type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  currency: string
  unit_amount: number
  active: boolean
  image_url: string | null
  stripe_price_id: string | null
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'canceled' | 'failed'

export type OrderRow = {
  id: string
  user_id: string | null
  product_id: string
  quantity: number
  currency: string
  amount_subtotal: number
  amount_total: number
  status: OrderStatus
  checkout_session_id: string | null
  payment_intent_id: string | null
  customer_email: string | null
  product_snapshot: Record<string, unknown>
  metadata: Record<string, unknown>
  paid_at: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow
        Insert: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: OrderRow
        Insert: Omit<OrderRow, 'id' | 'created_at' | 'updated_at' | 'paid_at'> & {
          id?: string
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<OrderRow, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
