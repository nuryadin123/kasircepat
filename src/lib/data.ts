import { Product, Customer, Sale, User } from '@/types';

export const mockUsers: Record<string, User> = {
  admin: {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@kasiran.com',
    role: 'admin',
    avatar: '/avatars/01.png',
  },
  manager: {
    id: 'user-2',
    name: 'Manager',
    email: 'manager@kasiran.com',
    role: 'manager',
    avatar: '/avatars/02.png',
  },
  cashier: {
    id: 'user-3',
    name: 'Cashier',
    email: 'cashier@kasiran.com',
    role: 'cashier',
    avatar: '/avatars/03.png',
  },
};

export const mockProducts: Product[] = [
  { id: 'prod-001', name: 'Kopi Americano', price: 25000, stock: 100, category: 'Minuman', createdAt: '2023-10-01' },
  { id: 'prod-002', name: 'Croissant Cokelat', price: 18000, stock: 50, category: 'Roti', createdAt: '2023-10-01' },
  { id: 'prod-003', name: 'Teh Melati', price: 20000, stock: 80, category: 'Minuman', createdAt: '2023-10-02' },
  { id: 'prod-004', name: 'Roti Keju', price: 17000, stock: 45, category: 'Roti', createdAt: '2023-10-02' },
  { id: 'prod-005', name: 'Jus Jeruk', price: 22000, stock: 60, category: 'Minuman', createdAt: '2023-10-03' },
  { id: 'prod-006', name: 'Donat Gula', price: 12000, stock: 120, category: 'Roti', createdAt: '2023-10-03' },
  { id: 'prod-007', name: 'Kopi Latte', price: 28000, stock: 90, category: 'Minuman', createdAt: '2023-10-04' },
  { id: 'prod-008', name: 'Air Mineral', price: 8000, stock: 200, category: 'Minuman', createdAt: '2023-10-04' },
  { id: 'prod-009', name: 'Sandwich Ayam', price: 35000, stock: 30, category: 'Makanan', createdAt: '2023-10-05' },
  { id: 'prod-010', name: 'Nasi Goreng', price: 45000, stock: 25, category: 'Makanan', createdAt: '2023-10-05' },
];

export const mockCustomers: Customer[] = [
  { id: 'cust-001', name: 'Budi Santoso', email: 'budi.s@example.com', phone: '081234567890', joinedDate: '2023-01-15', totalSpent: 1250000 },
  { id: 'cust-002', name: 'Citra Lestari', email: 'citra.l@example.com', phone: '081234567891', joinedDate: '2023-02-20', totalSpent: 875000 },
  { id: 'cust-003', name: 'Dewi Anggraini', email: 'dewi.a@example.com', phone: '081234567892', joinedDate: '2023-03-10', totalSpent: 2150000 },
  { id: 'cust-004', name: 'Eko Prasetyo', email: 'eko.p@example.com', phone: '081234567893', joinedDate: '2023-04-05', totalSpent: 550000 },
  { id: 'cust-005', name: 'Fitri Handayani', email: 'fitri.h@example.com', phone: '081234567894', joinedDate: '2023-05-21', totalSpent: 1750000 },
];

export const mockSales: Sale[] = [
  {
    id: 'sale-001',
    date: '2024-07-28T10:30:00Z',
    items: [
      { productId: 'prod-001', name: 'Kopi Americano', price: 25000, quantity: 1 },
      { productId: 'prod-002', name: 'Croissant Cokelat', price: 18000, quantity: 2 },
    ],
    total: 61000,
    paymentMethod: 'Card',
  },
  {
    id: 'sale-002',
    date: '2024-07-28T11:15:00Z',
    items: [
      { productId: 'prod-007', name: 'Kopi Latte', price: 28000, quantity: 2 },
    ],
    total: 56000,
    paymentMethod: 'Cash',
  },
  {
    id: 'sale-003',
    date: '2024-07-27T14:00:00Z',
    items: [
      { productId: 'prod-009', name: 'Sandwich Ayam', price: 35000, quantity: 1 },
      { productId: 'prod-005', name: 'Jus Jeruk', price: 22000, quantity: 1 },
    ],
    total: 57000,
    paymentMethod: 'Card',
  },
  {
    id: 'sale-004',
    date: '2024-07-27T16:45:00Z',
    items: [
      { productId: 'prod-006', name: 'Donat Gula', price: 12000, quantity: 5 },
    ],
    total: 60000,
    paymentMethod: 'Cash',
  },
  {
    id: 'sale-005',
    date: '2024-07-26T09:00:00Z',
    items: [
        { productId: 'prod-010', name: 'Nasi Goreng', price: 45000, quantity: 2 },
        { productId: 'prod-003', name: 'Teh Melati', price: 20000, quantity: 2 },
    ],
    total: 130000,
    paymentMethod: 'Card',
  }
];
