import { request } from './api';
import { User, Book } from '../types';

export const userService = {
  getProfile: (userId: string) =>
    request<{ success: boolean; user: Omit<User, 'email' | 'balance'>; books: Book[] }>(
      `/users/${userId}`,
      { auth: false }
    ),

  updateProfile: (updates: { name?: string; bio?: string }) =>
    request<{ success: boolean; user: User }>('/users/me', {
      method: 'PUT',
      body: updates as Record<string, unknown>,
    }),

  topUp: (amount: number) =>
    request<{ success: boolean; message: string; balance: number }>('/users/me/topup', {
      method: 'POST',
      body: { amount } as Record<string, unknown>,
    }),

  getMyBooks: (page = 1) =>
    request<{ success: boolean; total: number; pages: number; books: Book[] }>(
      `/users/me/books?page=${page}`
    ),
};
