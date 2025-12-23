import { supabase } from './supabase';
import type { Order, OrderItem } from '../types';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryOperation<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Operation attempt ${attempt + 1} failed:`, error);
      
      if (attempt < MAX_RETRIES - 1) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        await delay(retryDelay);
      }
    }
  }
  
  throw lastError;
}

export async function createOrder(order: Omit<Order, 'id'>) {
  return retryOperation(async () => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: order.tableId,
        status: order.status,
        total: order.total,
        special_notes: order.specialNotes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = order.items.map(item => ({
      order_id: orderData.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image,
      customizations: item.customizations || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return orderData;
  });
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  return retryOperation(async () => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  });
}

export async function addItemsToOrder(orderId: string, items: OrderItem[], newTotal: number) {
  return retryOperation(async () => {
    const orderItems = items.map(item => ({
      order_id: orderId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image_url: item.image,
      customizations: item.customizations || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    const { error: orderError } = await supabase
      .from('orders')
      .update({ total: newTotal })
      .eq('id', orderId);

    if (orderError) throw orderError;
  });
}

export async function getOrders() {
  return retryOperation(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      tableId: order.table_id,
      status: order.status,
      total: order.total,
      specialNotes: order.special_notes,
      createdAt: new Date(order.created_at),
      items: order.order_items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image_url,
        customizations: item.customizations,
      })),
      isParcel: order.table_id === 99,
    }));
  });
}