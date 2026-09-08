import AsyncStorage from '@react-native-async-storage/async-storage';

// Change to your machine's local IP when testing on a physical device
export const BASE_URL = 'http://localhost:3000/api';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | FormData;
  auth?: boolean;
  isFormData?: boolean;
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, isFormData = false } = options;

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };

  if (body) {
    config.body = isFormData ? (body as unknown as FormData) : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data as T;
}
