export interface IVoucherFilter {
  code?: string;
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IVoucherCreate {
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  quantity: number;
  startDate: string | Date;
  endDate: string | Date;
  minOrderValue?: number;
  maxDiscount?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface IVoucherUpdate {
  name?: string;
  quantity?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  minOrderValue?: number;
  maxDiscount?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface IVoucherValidate {
  code: string;
  orderValue?: number;
  userId?: string;
}

export interface IUserVoucherParams {
  page?: number;
  limit?: number;
}