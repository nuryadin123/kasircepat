import { Product, Sale, User, Customer } from '@/types';

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

export const mockProducts: Product[] = [];

export const mockSales: Sale[] = [];

export const mockCustomers: Customer[] = [];
