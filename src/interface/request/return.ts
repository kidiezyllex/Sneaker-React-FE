export interface IReturnFilter {
  status?: 'CHO_XU_LY' | 'DA_HOAN_TIEN' | 'DA_HUY';
  customer?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IReturnItem {
  product: string;
  variant: {
    colorId: string;
    sizeId: string;
  };
  quantity: number;
  price: number;
  reason?: string;
}

export interface IReturnCreate {
  originalOrder: string;
  customer: string;
  items: IReturnItem[];
  totalRefund: number;
}

export interface IReturnUpdate {
  items?: IReturnItem[];
  totalRefund?: number;
}

export interface IReturnStatusUpdate {
  status: 'CHO_XU_LY' | 'DA_HOAN_TIEN' | 'DA_HUY';
}

export interface IReturnSearchParams {
  query: string;
}

export interface IReturnStatsParams {
  startDate?: string;
  endDate?: string;
}


export interface IReturnableOrdersParams {
  page?: number;
  limit?: number;
}

export interface ICustomerReturnItem {
  productId?: number;
  productVariantId: number;
  quantity: number;
}

export interface ICustomerReturnRequest {
  originalOrderId: number;
  reason: string;
  items: ICustomerReturnItem[];
}

export interface IMyReturnsParams {
  status?: 'CHO_XU_LY' | 'DA_HOAN_TIEN' | 'DA_HUY';
  page?: number;
  limit?: number;
}