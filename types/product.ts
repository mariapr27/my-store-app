export type ProductCategory = 'cleaning' | 'organic';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  orderNumber: string;
  date: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  paymentMethod: string;
}
