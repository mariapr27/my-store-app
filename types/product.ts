export type ProductCategory = 'cleaning' | 'organic';

export interface Product { 
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  stock: number; 
  createdAt?: Date;
}

export interface CartItem { 
  product: Product;
  //productId: string;
  quantity: number;
}

export interface CartDocument {
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInfo { // Extra variables para los detalles adicionales de la factura
  [x: string]: any;
  fullName: string;
  cedula: string;
  email: string;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
  phone: string;
  address: string;
}

export interface Order { // Extra variables para el detalle de la factura
  orderNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  paymentMethod: string;
}

// export interface RegistroPago {
//   fullName: string;
//   cedula: string;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
//   phone: string;
//   numeroComprobante: number;
//   referencia: number;
//   fechaPago: Date;
// }
