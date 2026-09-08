export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
  balance: number;
  createdAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string | null;
  fileUrl: string;
  fileSize: number;
  genre: string;
  language: string;
  pages: number | null;
  seller: {
    _id: string;
    name: string;
    avatar: string | null;
    bio?: string;
  };
  salesCount: number;
  rating: {
    average: number;
    count: number;
  };
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  book: string;
  reviewer: {
    _id: string;
    name: string;
    avatar: string | null;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  buyer: { _id: string; name: string; email: string } | string;
  book: Book | string;
  seller: { _id: string; name: string } | string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  paymentMethod: 'wallet' | 'free';
  createdAt: string;
}

export type Genre =
  | 'Fiction'
  | 'Non-Fiction'
  | 'Science'
  | 'Technology'
  | 'Business'
  | 'Biography'
  | 'History'
  | 'Romance'
  | 'Mystery'
  | 'Fantasy'
  | 'Self-Help'
  | 'Health'
  | 'Religion'
  | 'Politics'
  | 'Art'
  | 'Travel'
  | 'Other';

export const GENRES: Genre[] = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology', 'Business',
  'Biography', 'History', 'Romance', 'Mystery', 'Fantasy',
  'Self-Help', 'Health', 'Religion', 'Politics', 'Art', 'Travel', 'Other',
];

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
