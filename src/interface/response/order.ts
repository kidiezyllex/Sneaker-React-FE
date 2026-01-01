import { IVoucher } from "./voucher";
import { IApiResponse, IApiListResponse } from "../common";

export interface IOrderProduct {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  price?: number;
}

export interface IOrderCustomer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  addresses?: any[];
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

export interface IProductVariant {
  id: number;
  productId: number;
  colorId: number;
  sizeId: number;
  price: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    code: string;
    name: string;
    description: string;
    weight: string;
    status: string;
    brand: {
      id: number;
      name: string;
    };
    category: {
      id: number;
      name: string;
    };
    material: {
      id: number;
      name: string;
    };
  };
  color: {
    id: number;
    name: string;
    code: string;
  };
  size: {
    id: number;
    value: string;
  };
  images: Array<{
    id: number;
    imageUrl: string;
  }>;
}

export interface IPopulatedOrderItem extends Omit<IOrderItem, 'product'> {
  product?: IOrderProduct;
  productVariant?: IProductVariant;
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

export interface IOrdersResponse extends IApiListResponse<IOrder> {}

export interface IActionResponse extends IApiResponse<any> {}

export interface IPOSOrderCreateResponse extends IApiResponse<IOrder> {}