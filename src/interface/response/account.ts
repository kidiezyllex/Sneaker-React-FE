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

export interface IAccountsResponse extends IApiListResponse<IAccount> {}

export interface IProfileResponse extends IApiResponse<IAccount> {}

export interface IActionResponse extends IApiResponse<{ message: string }> {}