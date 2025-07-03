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
  email: string;
  phone: string;
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
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Cash' | 'Card';
  customer?: Customer;
};

export type User = {
  id: string;
  name: "Admin" | "Manager" | "Cashier";
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  avatar: string;
};
