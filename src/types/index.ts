export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  cost: number;
};

export type SaleItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  cost: number;
};

export type Sale = {
  id: string;
  transactionId?: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'Cash' | 'Card';
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

export type CashFlowEntry = {
    id: string;
    date: string;
    type: 'Pemasukan' | 'Pengeluaran';
    description: string;
    amount: number;
};

export type Customer = {
  id: string;
  name: string;
  discount: number;
  totalSpent: number;
  joinedDate: string;
};
