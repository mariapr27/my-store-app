// Tipos para la base de datos

export interface Product {
  id?: string; // UUID en PostgreSQL
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image_url?: string;
  category?: string;
  saleType: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image_url?: string;
  category?: string;
  saleType: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  category?: string;
  saleType?: string;
}

// Tipos para órdenes
export interface OrderItem {
  id?: number;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  created_at?: Date;
}

export interface Order {
  id?: string;
  order_number: string;
  date: Date;
  customer_full_name: string;
  customer_cedula: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  fecha_pago?: Date;
  comprobante?: string;
  banco_emisor?: string;
  total: number;
  payment_method: string;
  status: string; // 'pending', 'confirmed', 'completed', 'cancelled'
  created_at?: Date;
  updated_at?: Date;
  items?: OrderItem[]; // Para cuando se incluyen los items en la respuesta
}

export interface CreateOrderInput {
  order_number: string;
  date: Date | string;
  customer_full_name: string;
  customer_cedula: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  fecha_pago?: Date | string;
  comprobante?: string;
  banco_emisor?: string;
  total: number;
  payment_method: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
  }>;
}

export interface UpdateOrderInput {
  status?: string;
}

// Tipos genéricos para respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

