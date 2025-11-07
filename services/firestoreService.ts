import { 
    collection, 
    addDoc, 
    serverTimestamp,
    doc,
    setDoc 
  } from 'firebase/firestore';
  import { db } from '../firebaseConfig';

  export interface OrderData {
    orderNumber: string;
    date: string;
    customer: {
      fullName: string;
      cedula: string;
      email: string;
      phone: string;
      address: string;
      fechaPago: string;
      comprobante: string;
      bancoEmisor: string;
    };
    items: Array<{
      product: {
        id: string;
        name: string;
        price: number;
      };
      quantity: number;
    }>;
    total: number;
    paymentMethod: string;
    status: string; // 'pending', 'confirmed', 'completed', 'cancelled'
    createdAt: any; // Server timestamp
  }

  export const saveOrderToFirestore = async (orderData: Omit<OrderData, 'createdAt' | 'status'>): Promise<string> => {
    try {
      // Agregar timestamp y estado
      const orderWithMetadata: OrderData = {
        ...orderData,
        status: 'pending', // Estado inicial
        createdAt: serverTimestamp()
      };
  
      // Guardar en la colección 'orders'
      const docRef = await addDoc(collection(db, 'orders'), orderWithMetadata);
      
      console.log('Orden guardada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando orden en Firestore:', error);
      throw error;
    }
  };

  // Opcional: Guardar también información del cliente por separado
export const saveCustomerInfo = async (customerInfo: any) => {
    try {
      await setDoc(doc(db, 'customers', customerInfo.cedula), {
        ...customerInfo,
        lastOrder: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error guardando información del cliente:', error);
    }
  };

  
