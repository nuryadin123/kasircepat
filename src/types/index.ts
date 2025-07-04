export type Product = {
  id: string;
  name: string;
  variant?: string;
  price: number;
  stock: number;
  createdAt: string;
  cost: number;
};

export type SaleItem = {
  productId: string;
  name: string;
  variant?: string;
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
  cashierId: string;
  cashierName: string;
};

export type User = {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  role: 'admin' | 'cashier';
};

export type CashFlowEntry = {
    id: string;
    date: string;
    type: 'Pemasukan' | 'Pengeluaran';
    description: string;
    amount: number;
};
