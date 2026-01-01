import { IApiResponse, IApiListResponse } from "../common";

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

export interface IPromotionResponse extends IApiResponse<IPromotion> {}

export interface IPromotionsResponse extends IApiListResponse<IPromotion> {}

export interface IProductPromotionsResponse extends IApiResponse<Pick<IPromotion, 'id' | 'name' | 'discountPercent' | 'startDate' | 'endDate'>[]> {}

export interface IActionResponse extends IApiResponse<any> {}