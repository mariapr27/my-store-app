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

// Tipos genéricos para respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

