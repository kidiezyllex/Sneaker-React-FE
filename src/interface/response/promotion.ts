import { IApiResponse } from "../common";

export interface IPromotionProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  images?: string[];
}

export interface IPromotion {
  id: number;
  name: string;
  description?: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface IPromotionPagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface IPromotionListData {
  promotions: IPromotion[];
  pagination: IPromotionPagination;
}

export interface IPromotionResponse extends IApiResponse<IPromotion> {}

export interface IPromotionsResponse {
  success: boolean;
  message: string;
  data: IPromotionListData;
}

export interface IProductPromotionsResponse extends IApiResponse<Pick<IPromotion, 'id' | 'name' | 'discountPercent' | 'startDate' | 'endDate'>[]> {}

export interface IActionResponse extends IApiResponse<any> {}