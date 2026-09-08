import { request } from './api';
import { User } from '../types';

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { name, email, password } as Record<string, unknown>,
      auth: false,
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password } as Record<string, unknown>,
      auth: false,
    }),

  getMe: () =>
    request<{ success: boolean; user: User }>('/auth/me'),
};
