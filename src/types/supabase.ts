export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics: {
        Row: {
          id: string
          order_id: string
          total_amount: number
          payment_status: 'paid' | 'unpaid'
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          total_amount: number
          payment_status?: 'paid' | 'unpaid'
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          total_amount?: number
          payment_status?: 'paid' | 'unpaid'
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          name: string
          quantity: number
          price: number
          image_url: string
          customizations: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          name: string
          quantity: number
          price: number
          image_url: string
          customizations?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          name?: string
          quantity?: number
          price?: number
          image_url?: string
          customizations?: string[] | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          table_id: number
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
          total: number
          special_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          table_id: number
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
          total: number
          special_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          table_id?: number
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
          total?: number
          special_notes?: string | null
          created_at?: string
        }
      }
    }
  }
}