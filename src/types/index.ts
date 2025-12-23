export interface Table {
  id: number;
  status: 'free' | 'occupied' | 'order-in-progress';
  waiter?: string;
  orders?: Order[];
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  specialNotes?: string;
  createdAt: Date;
  total: number;
  isParcel?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  description?: string;
  category?: string;
  dietary?: string[];
  customizations?: string[];
}

export interface Waiter {
  id: string;
  name: string;
  tables: number[];
  activeOrders: number;
}