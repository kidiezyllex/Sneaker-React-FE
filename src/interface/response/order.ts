import { IVoucher } from "./voucher";
import { IApiResponse, IApiListResponse } from "../common";

export interface IOrderProduct {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  price?: number;
}

import { IAddress } from "../request/account";

export interface IOrderCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  addresses?: IAddress[];
}

export interface IOrderStaff {
  id: string;
  fullName: string;
}

export interface IOrderItem {
  id: string;
  product: string; 
  variant?: {
    colorId?: string;
    sizeId?: string;
  };
  quantity: number;
  price: number;
}

// Color interface
export interface IColor {
  id: number;
  name: string;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Size interface
export interface ISize {
  id: number;
  value: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Image interface
export interface IVariantImage {
  id: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// Product Variant interface - phù hợp với API mới
export interface IProductVariant {
  id: number;
  color: IColor;
  size: ISize;
  price: number;
  stock: number;
  images: IVariantImage[];
  createdAt: string;
  updatedAt: string;
}

// Order Item với variant - phù hợp với API mới
export interface IPopulatedOrderItem {
  id: number;
  variant: IProductVariant;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface IShippingAddress {
  name: string;
  phoneNumber: string;
  provinceId: string; 
  districtId: string; 
  wardId: string;     
  specificAddress: string;
}

export interface IOrder {
  id: string;
  orderNumber?: string;
  code: string;
  customerId?: number;
  staffId?: number;
  voucherId?: number | null;
  customer: IOrderCustomer;
  staff?: IOrderStaff;
  items: IPopulatedOrderItem[];
  voucher?: any;
  subTotal: number;
  discount: number;
  total: number;
  shippingAddress?: IShippingAddress;
  shippingName: string;
  shippingPhoneNumber: string;
  shippingProvinceId: string;
  shippingDistrictId: string;
  shippingWardId: string;
  shippingSpecificAddress: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'COD' | 'MIXED';
  paymentStatus: 'PENDING' | 'PARTIAL_PAID' | 'PAID';
  orderStatus: 'CHO_XAC_NHAN' | 'CHO_GIAO_HANG' | 'DANG_VAN_CHUYEN' | 'DA_GIAO_HANG' | 'HOAN_THANH' | 'DA_HUY';
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderResponse extends IApiResponse<IOrder> {}

// Pagination interface cho orders
export interface IOrderPagination {
  totalItems: number;
  limit: number;
  currentPage: number;
  totalPages: number;
}

// Orders response với cấu trúc mới
export interface IOrdersResponse {
  statusCode: number;
  message: string;
  data: {
    pagination: IOrderPagination;
    orders: IOrder[];
  };
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}

export interface IActionResponse extends IApiResponse<any> {}

export interface IPOSOrderCreateResponse extends IApiResponse<IOrder> {}