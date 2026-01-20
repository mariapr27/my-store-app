import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import { Product, ProductCategory } from '../types/product';
import {
  fetchProductsFromApi,
  createProductInApi,
  updateProductInApi,
  deleteProductInApi,
} from '../services/apiProducts';

export const [ProductsProvider, useProducts] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const apiProducts = await fetchProductsFromApi();
        setProducts(apiProducts);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        console.error('Error obteniendo productos desde API:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadProducts();
  }, []);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await createProductInApi(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct.id; // según lo que devuelva la API
    } catch (err) {
      console.error('Error agregando producto en API:', err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, productData: Partial<Omit<Product, 'id'>>) => {
    try {
      const updated = await updateProductInApi(productId, productData);
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, ...updated } : p))
      );
    } catch (err) {
      console.error('Error actualizando producto en API:', err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await deleteProductInApi(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error eliminando producto en API:', err);
      throw err;
    }
  }, []);
      
  const getProductById = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  const reduceProductStock = useCallback((productId: string, quantity: number) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stock: Math.max((p.stock || 0) - quantity, 0) } : p
      )
    );
  }, []);

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    reduceProductStock,
  };
});