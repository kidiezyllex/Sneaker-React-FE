import { IBaseResponse } from './authentication';
import { IAddress } from '../request/account';

export interface IAccount {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  gender?: 'Nam' | 'Nữ' | 'Khác';
  birthday?: string | Date;
  citizenId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  addresses: IAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface IAccountResponse extends IBaseResponse<IAccount> {}

export interface IPagination {
  count: number;
  totalPages: number;
  currentPage: number;
}

export interface IAccountsData {
  accounts: IAccount[];
  pagination: IPagination;
}

export interface IAccountsResponse extends IBaseResponse<IAccountsData> {}

export interface IProfileResponse extends IBaseResponse<IAccount> {}

export interface IActionResponse extends IBaseResponse<{
  message: string;
}> {}