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
  id: number;
  code: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  birthday?: string;
  gender?: boolean;
  avatar?: string | null;
  role?: string;
  citizenId?: string;
  status?: string;
  addresses?: any[];
}

export interface IReturnStaff {
  id: number;
  code: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  birthday?: string;
  gender?: boolean;
  avatar?: string | null;
  role?: string;
  citizenId?: string;
}

export interface IReturnOrder {
  id: number;
  code: string;
  subTotal: number;
  discount: number;
  total: number;
  shippingName?: string;
  shippingPhoneNumber?: string;
  shippingProvinceId?: string;
  shippingDistrictId?: string;
  shippingWardId?: string;
  shippingSpecificAddress?: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  items?: any[];
  createdAt: string;
  updatedAt?: string;
}

export interface IReturn {
  id: number;
  code: string;
  originalOrder: IReturnOrder;
  customer: IReturnCustomer;
  staff: IReturnStaff | null;
  items: string; // JSON string of items in new API
  totalRefund: number;
  reason: string;
  note: string;
  status: 'CHO_XU_LY' | 'DA_HOAN_TIEN' | 'DA_HUY';
  createdAt: string;
  updatedAt: string;
}

export interface IReturnResponse extends IApiResponse<IReturn> { }

// Returns response matching Spring Data Pageable
export interface IReturnsResponse {
  statusCode: number;
  message: string;
  data: {
    content: IReturn[];
    pageable: ISpringPageable;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    last: boolean;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  };
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}

export interface IReturnStats {
  totalReturns: number;
  pendingReturns: number;
  refundedReturns: number;
  cancelledReturns: number;
  totalRefundAmount: number;
}

export interface IReturnStatsResponse extends IApiResponse<IReturnStats> { }

export interface IReturnSearchResponse extends IApiResponse<IReturn[]> { }

export interface IActionResponse extends IApiResponse<any> { }

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

export interface IReturnableOrdersResponse {
  statusCode: number;
  message: string;
  data: {
    content: IReturnableOrder[];
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