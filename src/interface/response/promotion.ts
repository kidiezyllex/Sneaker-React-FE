import { IApiResponse, IApiMeta } from "../common";

export interface IPromotionProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  images?: string[];
}

export interface IPromotion {
  id: number;
  code?: string;
  name: string;
  description?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  // Some responses might include productIds or products
  productIds?: number[];
  products?: any[];
}

export interface IPromotionPagination {
  totalItems: number;
  limit: number;
  currentPage: number;
  totalPages: number;
}

export interface IPromotionListData {
  promotions: IPromotion[];
  pagination: IPromotionPagination;
}

export interface IPromotionResponse extends IApiResponse<IPromotion> {}

export interface IPromotionsResponse {
  statusCode: number;
  message: string;
  data: {
    pagination: IPromotionPagination;
    promotions: IPromotion[];
  };
  meta: IApiMeta;
}

export interface IProductPromotionsResponse extends IApiResponse<Pick<IPromotion, 'id' | 'name' | 'discountPercent' | 'startDate' | 'endDate'>[]> {}

export interface IActionResponse extends IApiResponse<any> {}