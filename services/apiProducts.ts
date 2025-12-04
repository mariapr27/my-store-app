// services/apiProducts.ts
const API_URL = 'http://localhost:3000'; // o la IP de tu PC si usas móvil

import { Product } from '../types/product';

// Función para mapear producto de PostgreSQL al formato del frontend
const mapProductFromApi = (apiProduct: any): Product => {
  return {
    id: String(apiProduct.id), // Convertir ID de number a string
    firebaseId: String(apiProduct.id), // Usar el mismo ID como firebaseId por compatibilidad
    name: apiProduct.name,
    description: apiProduct.description || '',
    price: typeof apiProduct.price === 'string' 
      ? parseFloat(apiProduct.price) 
      : Number(apiProduct.price), // Asegurar que price sea number
    stock: typeof apiProduct.stock === 'string' 
      ? parseInt(apiProduct.stock, 10) 
      : Number(apiProduct.stock || 0), // Asegurar que stock sea number
    image: apiProduct.image_url || '', // Mapear image_url a image
    category: (apiProduct.category as 'cleaning' | 'organic') || 'cleaning',
    saleType: (apiProduct.sale_type as 'detal' | 'mayor') || 'detal', // Mapear sale_type (DB) a saleType (frontend)
    createdAt: apiProduct.created_at 
      ? new Date(apiProduct.created_at) 
      : new Date(),
  };
};

export const fetchProductsFromApi = async (): Promise<Product[]> => {
  const res = await fetch(`${API_URL}/api/products`);
  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Error obteniendo productos');
  }
  
  // Mapear cada producto para convertir tipos y ajustar campos
  return json.data.map(mapProductFromApi);
};

export const createProductInApi = async (product: Omit<Product, 'id'>) => {
  // Mapear del formato frontend al formato del backend
  const apiProduct = {
    name: product.name,
    description: product.description || null,
    price: Number(product.price), // Asegurar que sea number
    stock: Number(product.stock || 0),
    image_url: product.image || null, // Mapear image a image_url
    category: product.category || null,
    sale_type: product.saleType || null,
  };
  
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiProduct),
  });
  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Error creando producto');
  }
  
  // Mapear la respuesta de vuelta al formato del frontend
  return mapProductFromApi(json.data);
};

export const updateProductInApi = async (id: string | number, data: Partial<Omit<Product,'id'>>) => {
  // Mapear del formato frontend al formato del backend
  const apiData: any = {};
  if (data.name !== undefined) apiData.name = data.name;
  if (data.description !== undefined) apiData.description = data.description;
  if (data.price !== undefined) apiData.price = Number(data.price);
  if (data.stock !== undefined) apiData.stock = Number(data.stock);
  if (data.image !== undefined) apiData.image_url = data.image; // Mapear image a image_url
  if (data.category !== undefined) apiData.category = data.category;
  if (data.saleType !== undefined) apiData.sale_type = data.saleType;
  // Asegurar que el ID sea string (UUID)
  const productId = String(id);
  
  const res = await fetch(`${API_URL}/api/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiData),
  });
  const json = await res.json();
  
  if (!json.success || !json.data) {
    throw new Error(json.error || 'Error actualizando producto');
  }
  
  // Mapear la respuesta de vuelta al formato del frontend
  return mapProductFromApi(json.data);
};

export const deleteProductInApi = async (id: string | number) => {
  // Asegurar que el ID sea string (UUID)
  const productId = String(id);
  await fetch(`${API_URL}/api/products/${productId}`, { method: 'DELETE' });
};