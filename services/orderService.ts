import { request } from './api';
import { Order } from '../types';

export interface OrdersResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  orders: Order[];
}

export const orderService = {
  buyBook: (bookId: string) =>
    request<{ success: boolean; message: string; order: Order }>('/orders', {
      method: 'POST',
      body: { bookId } as Record<string, unknown>,
    }),

  getMyPurchases: (page = 1) =>
    request<OrdersResponse>(`/orders/my-purchases?page=${page}`),

  getMySales: (page = 1) =>
    request<OrdersResponse & { totalEarnings: number }>(`/orders/my-sales?page=${page}`),
};
