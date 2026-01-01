import { IReturnItem } from "../request/return";
import { IApiResponse, IApiListResponse } from "../common";

export interface IReturnProduct {
  id: string;
  name: string;
  code: string;
  images?: string[];
  price?: number;
}

export interface IReturnCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface IReturnStaff {
  id: string;
  fullName: string;
}

export interface IReturnOrder {
  id: string;
  code: string;
  createdAt?: string;
}

export interface IPopulatedReturnItem extends Omit<IReturnItem, 'product'> {
  product: IReturnProduct;
}

export interface IReturn {
  id: string;
  code: string;
  originalOrder: string | IReturnOrder;
  customer: string | IReturnCustomer;
  staff: string | IReturnStaff;
  items: IPopulatedReturnItem[] | IReturnItem[];
  totalRefund: number;
  status: 'CHO_XU_LY' | 'DA_HOAN_TIEN' | 'DA_HUY';
  createdAt: string;
  updatedAt: string;
}

export interface IReturnResponse extends IApiResponse<IReturn> {}

export interface IReturnsResponse extends IApiListResponse<IReturn> {}

export interface IReturnStats {
  totalReturns: number;
  pendingReturns: number;
  refundedReturns: number;
  cancelledReturns: number;
  totalRefundAmount: number;
}

export interface IReturnStatsResponse extends IApiResponse<IReturnStats> {}

export interface IReturnSearchResponse extends IApiResponse<IReturn[]> {}

export interface IActionResponse extends IApiResponse<any> {}

export interface IReturnableOrderItem {
  product: {
    id: string;
    name: string;
    images: string[];
    code: string;
  };
  variant: any;
  quantity: number;
  price: number;
}

export interface IReturnableOrder {
  id: string;
  code: string;
  orderStatus: 'HOAN_THANH';
  items: IReturnableOrderItem[];
  total: number;
  createdAt: string;
}

export interface IReturnableOrdersResponse extends IApiListResponse<IReturnableOrder> {}