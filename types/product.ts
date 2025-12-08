export type ProductCategory = 'cleaning' | 'organic';
export type SaleType = 'detal' | 'mayor';

export interface Product { 
  id: string;
  firebaseId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  saleType?: SaleType; // 'detal' by default when not provided
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
  fechaPago: string; 
  comprobante: string;
  bancoEmisor: string;
}

export interface Order { // Extra variables para el detalle de la factura
  id?: string; // ID de PostgreSQL
  orderNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  fechaPago: string; 
  comprobante: string;
  bancoEmisor: string;
  
}

// export interface RegistroPago {
//   fullName: string;
//   cedula: string;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
//   phone: string;
//   numeroComprobante: number;
//   referencia: number;
//   fechaPago: Date;
// }
