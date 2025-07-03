export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  discount: number;
  joinedDate: string;
  totalSpent: number;
};

export type SaleItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Sale = {
  id: string;
  transactionId?: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Cash' | 'Card';
  customer?: Customer;
  subtotal?: number;
  discountAmount?: number;
  tax?: number;
};

export type User = {
  id: string;
  name: "Admin" | "Manager" | "Cashier";
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  avatar: string;
};
