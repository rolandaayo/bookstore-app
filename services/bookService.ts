import { request } from './api';
import { Book, Review, SortOption } from '../types';

export interface BooksResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  books: Book[];
}

export interface BookDetailResponse {
  success: boolean;
  book: Book;
  reviews: Review[];
}

export interface UploadBookPayload {
  title: string;
  author: string;
  description: string;
  price: string;
  genre: string;
  language?: string;
  pages?: string;
  bookFile: { uri: string; name: string; type: string };
  coverImage?: { uri: string; name: string; type: string } | null;
}

export const bookService = {
  getBooks: (params: {
    search?: string;
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: SortOption;
    page?: number;
    limit?: number;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.append(k, String(v));
    });
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<BooksResponse>(`/books${query}`, { auth: false });
  },

  getFeatured: () =>
    request<{ success: boolean; books: Book[] }>('/books/featured', { auth: false }),

  getGenres: () =>
    request<{ success: boolean; genres: string[] }>('/books/genres', { auth: false }),

  getBook: (id: string) =>
    request<BookDetailResponse>(`/books/${id}`, { auth: false }),

  uploadBook: (payload: UploadBookPayload) => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('author', payload.author);
    form.append('description', payload.description);
    form.append('price', payload.price);
    form.append('genre', payload.genre);
    if (payload.language) form.append('language', payload.language);
    if (payload.pages) form.append('pages', payload.pages);

    // React Native file objects
    form.append('bookFile', payload.bookFile as unknown as Blob);
    if (payload.coverImage) {
      form.append('coverImage', payload.coverImage as unknown as Blob);
    }

    return request<{ success: boolean; book: Book }>('/books', {
      method: 'POST',
      body: form as unknown as Record<string, unknown>,
      isFormData: true,
    });
  },

  updateBook: (id: string, updates: Partial<Book>) =>
    request<{ success: boolean; book: Book }>(`/books/${id}`, {
      method: 'PUT',
      body: updates as Record<string, unknown>,
    }),

  deleteBook: (id: string) =>
    request<{ success: boolean; message: string }>(`/books/${id}`, { method: 'DELETE' }),

  addReview: (bookId: string, rating: number, comment: string) =>
    request<{ success: boolean; review: Review }>(`/books/${bookId}/reviews`, {
      method: 'POST',
      body: { rating, comment } as Record<string, unknown>,
    }),
};
