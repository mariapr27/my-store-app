import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Product, ProductCategory } from '../types/product';

export const [ProductsProvider, useProducts] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const productsQuery = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(productsQuery, 
      (snapshot) => {
        const productsData: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            image: data.image,
            category: data.category as ProductCategory,
            stock: data.stock || 0,
            createdAt: data.createdAt?.toDate(),
          });
        });
        setProducts(productsData);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
        console.error('Error obteniendo productos:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        stock: productData.stock || 0,
        createdAt: new Date(),
      });
      console.log('Producto agregado con ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.error('Error agregando producto:', err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, productData: Partial<Omit<Product, 'id'>>) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, productData);
      console.log('Producto actualizado:', productId);
    } catch (err) {
      console.error('Error actualizando producto:', err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      console.log('Producto eliminado:', productId);
    } catch (err) {
      console.error('Error eliminando producto:', err);
      throw err;
    }
  }, []);

  const getProductById = useCallback((id: string) => {
    return products.find((p) => p.id === id);
  }, [products]);

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
});