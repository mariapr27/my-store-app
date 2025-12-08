// services/apiOrders.ts
const API_URL = 'http://localhost:3000'; // o la IP de tu PC si usas móvil

import { Order } from '../types/product';

// Función para mapear orden de PostgreSQL al formato del frontend
const mapOrderFromApi = (apiOrder: any): Order => {
  return {
    id: String(apiOrder.id), // ID de la orden
    orderNumber: apiOrder.order_number,
    date: apiOrder.date 
      ? (typeof apiOrder.date === 'string' ? apiOrder.date : apiOrder.date.toISOString())
      : new Date().toISOString(),
    customer: {
      fullName: apiOrder.customer_full_name,
      cedula: apiOrder.customer_cedula,
      email: apiOrder.customer_email,
      phone: apiOrder.customer_phone,
      address: apiOrder.customer_address,
      fechaPago: apiOrder.fecha_pago 
        ? (typeof apiOrder.fecha_pago === 'string' 
            ? apiOrder.fecha_pago 
            : apiOrder.fecha_pago.toISOString().split('T')[0])
        : '',
      comprobante: apiOrder.comprobante || '',
      bancoEmisor: apiOrder.banco_emisor || '',
    },
    items: (apiOrder.items || []).map((item: any) => ({
      product: {
        id: String(item.product_id),
        firebaseId: String(item.product_id),
        name: item.product_name,
        description: '',
        price: typeof item.product_price === 'string' 
          ? parseFloat(item.product_price) 
          : Number(item.product_price),
        image: '',
        category: 'cleaning' as const,
        stock: 0,
      },
      quantity: typeof item.quantity === 'string' 
        ? parseInt(item.quantity, 10) 
        : Number(item.quantity),
    })),
    total: typeof apiOrder.total === 'string' 
      ? parseFloat(apiOrder.total) 
      : Number(apiOrder.total),
    paymentMethod: apiOrder.payment_method || 'Transferencia',
    fechaPago: apiOrder.fecha_pago 
      ? (typeof apiOrder.fecha_pago === 'string' 
          ? apiOrder.fecha_pago 
          : apiOrder.fecha_pago.toISOString().split('T')[0])
      : '',
    comprobante: apiOrder.comprobante || '',
    bancoEmisor: apiOrder.banco_emisor || '',
  };
};

export const fetchOrdersFromApi = async (): Promise<Order[]> => {
  const res = await fetch(`${API_URL}/api/orders`);
  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Error obteniendo órdenes');
  }
  
  // Mapear cada orden para convertir tipos y ajustar campos
  return json.data.map(mapOrderFromApi);
};

export const fetchOrderByIdFromApi = async (id: string | number): Promise<Order> => {
  const orderId = String(id);
  const res = await fetch(`${API_URL}/api/orders/${orderId}`);
  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Error obteniendo la orden');
  }
  
  return mapOrderFromApi(json.data);
};

export const createOrderInApi = async (order: Omit<Order, 'id'>) => {
  // Mapear del formato frontend al formato del backend
  const apiOrder = {
    orderNumber: order.orderNumber,
    date: order.date,
    customer: {
      fullName: order.customer.fullName,
      cedula: order.customer.cedula,
      email: order.customer.email,
      phone: order.customer.phone,
      address: order.customer.address,
      fechaPago: order.customer.fechaPago || order.fechaPago,
      comprobante: order.customer.comprobante || order.comprobante,
      bancoEmisor: order.customer.bancoEmisor || order.bancoEmisor,
    },
    items: order.items.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: Number(item.product.price),
      },
      quantity: Number(item.quantity),
    })),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
  };
  
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiOrder),
  });
  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Error creando orden');
  }
  
  // Mapear la respuesta de vuelta al formato del frontend
  return mapOrderFromApi(json.data);
};

export const updateOrderStatusInApi = async (
  id: string | number, 
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
) => {
  const orderId = String(id);
  
  const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Error actualizando estado de la orden');
  }
  
  return mapOrderFromApi(json.data);
};

