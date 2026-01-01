import { IBankTransferInfo } from "../request/payment";
import { IOrder } from "./order";
import { IApiResponse, IApiListResponse } from "../common";

export interface IPaymentOrder {
  id: string;
  code: string;
  customer: {
    id: string;
    fullName: string;
    code?: string;
    email?: string;
  };
  total: number;
  paymentStatus?: 'PENDING' | 'PARTIAL_PAID' | 'PAID';
  orderStatus?: 'CHO_XAC_NHAN' | 'CHO_GIAO_HANG' | 'DANG_VAN_CHUYEN' | 'DA_GIAO_HANG' | 'HOAN_THANH' | 'DA_HUY';
}

export interface IPayment {
  id: string;
  code: string;
  order: string | IPaymentOrder;
  amount: number;
  method: 'CASH' | 'BANK_TRANSFER';
  bankTransferInfo?: IBankTransferInfo;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentResponse extends IApiResponse<IPayment> {}

export interface IPaymentsResponse extends IApiListResponse<IPayment> {}

export interface IActionResponse extends IApiResponse<any> {}