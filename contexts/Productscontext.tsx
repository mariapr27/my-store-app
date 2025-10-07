import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Product } from '../types/product';
import { products as initialProducts } from '../data/products';

const PRODUCTS_STORAGE_KEY = '@products_list';

export const [ProductsProvider, useProducts] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const stored = await AsyncStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (stored) {
        setProducts(JSON.parse(stored));
      } else {
        setProducts(initialProducts);
        await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(initialProducts));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(initialProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProducts = useCallback(async (newProducts: Product[]) => {
    try {
      await AsyncStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(newProducts));
      setProducts(newProducts);
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
  }, [products, saveProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    saveProducts(updatedProducts);
  }, [products, saveProducts]);

  const deleteProduct = useCallback((id: string) => {
    const updatedProducts = products.filter((p) => p.id !== id);
    saveProducts(updatedProducts);
  }, [products, saveProducts]);

  const getProductById = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  return useMemo(
    () => ({
      products,
      isLoading,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
    }),
    [products, isLoading, addProduct, updateProduct, deleteProduct, getProductById]
  );
});
