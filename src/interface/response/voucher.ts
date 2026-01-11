import { IApiResponse } from "../common";

export interface IVoucher {
  id: number | string;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  quantity: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  maxDiscount: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
  discountAmount?: number;
}

export interface IVoucherResponse extends IApiResponse<IVoucher> {}

export interface IVouchersResponse {
  statusCode: number;
  message: string;
  data: {
    pagination: {
      totalItems: number;
      limit: number;
      currentPage: number;
      totalPages: number;
    };
    vouchers: IVoucher[];
  } | IVoucher[];
  meta?: {
    timestamp: string;
    apiVersion: string;
  };
}

export interface IVoucherValidationData {
  voucher: IVoucher;
  discountAmount: number;
}

export interface IVoucherValidationResponse extends IApiResponse<IVoucherValidationData> {}

export interface INotificationResponse extends IApiResponse<any> {}

export interface IActionResponse extends IApiResponse<any> {}
