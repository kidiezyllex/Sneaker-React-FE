export enum UserRole {
  ADMIN = 'admin',
  DESIGNER = 'designer',
}

// Standardized API Response Interfaces
export interface IApiMeta {
  timestamp: string;
  apiVersion: string;
}

export interface IApiPagination {
  total: number;
  count: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
}

// Base response for single item
export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta: IApiMeta;
}

// Base response for list/paginated items
export interface IApiListResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  pagination: IApiPagination;
  meta: IApiMeta;
}

// Legacy base response (for backward compatibility during migration)
export interface IBaseResponse<T> {
  success: boolean;
  message?: string;
  data: T;
} 