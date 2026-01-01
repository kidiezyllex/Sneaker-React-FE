import { IApiResponse, IApiListResponse } from "../common";

export interface IVoucher {
  id: string;
  code: string;
  name: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  quantity: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  maxDiscount?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
}

export interface IVoucherResponse extends IApiResponse<IVoucher> {}

export interface IVouchersResponse extends IApiListResponse<IVoucher> {}

export interface IVoucherValidationData {
  voucher: IVoucher;
  discountValue: number;
}

export interface IVoucherValidationResponse extends IApiResponse<IVoucherValidationData> {}

export interface INotificationResponse extends IApiResponse<any> {}

export interface IActionResponse extends IApiResponse<any> {}
