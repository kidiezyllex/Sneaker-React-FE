import { IApiResponse } from "../common";

export interface IColor {
  name: string;
}

export interface ISize {
  value: number;
}

export interface IVariantImage {
  imageUrl: string;
}

export interface IProductVariant {
  color: IColor;
  size: ISize;
  images: IVariantImage[];
}

export interface IPopulatedOrderItem {
  id: number;
  variant: IProductVariant;
  product?: {
    name: string;
    variants?: {
      images: { imageUrl: string }[];
    }[];
  };
  quantity: number;
  price: number;
}

export interface IOrder {
  id: number;
  code: string;
  subTotal: number;
  discount: number;
  total: number;
  shippingName: string;
  shippingPhoneNumber: string;
  shippingEmail?: string;
  shippingSpecificAddress: string;
  shippingAddress?: {
    specificAddress: string;
  };
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'COD' | 'MIXED';
  paymentStatus: 'PENDING' | 'PARTIAL_PAID' | 'PAID';
  orderStatus: 'CHO_XAC_NHAN' | 'CHO_GIAO_HANG' | 'DANG_VAN_CHUYEN' | 'DA_GIAO_HANG' | 'HOAN_THANH' | 'DA_HUY';
  items: IPopulatedOrderItem[];
  customer?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  staff?: {
    fullName: string;
  };
  voucher?: {
    code: string;
  };
  createdAt: string;
}

export interface IOrderResponse extends IApiResponse<IOrder> { }

export interface IOrdersResponse {
  statusCode: number;
  message: string;
  data: {
    pagination: {
      totalItems: number;
      limit: number;
      currentPage: number;
      totalPages: number;
    };
    orders: IOrder[];
  };
  meta: {
    timestamp: string;
    apiVersion: string;
  };
}

export interface IActionResponse extends IApiResponse<any> { }