import { IApiResponse, IApiListResponse } from '../common';
import { IAddress } from '../request/account';

export interface IAccount {
  id: number | string;
  code: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  gender?: boolean;
  birthday?: string | Date;
  citizenId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string | null;
  addresses: IAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface IAccountResponse extends IApiResponse<IAccount> {}

// Spring Pageable response structure
export interface ISpringPageable {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  unpaged: boolean;
  paged: boolean;
}

export interface IAccountsResponse {
  statusCode: number;
  message: string;
  data: {
    content: IAccount[];
    pageable: ISpringPageable;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
  };
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}

export interface IProfileResponse extends IApiResponse<IAccount> {}

export interface IActionResponse extends IApiResponse<{ message: string }> {}