import { IApiResponse } from "../common";

export interface IStatisticsItem {
  date: string;
  totalProfit: number;
  newCustomers: number;
  averageOrderValue: number;
  totalOrders: number;
  totalRevenue: number;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface IRevenuePeriod {
  period: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface ITopProductItem {
  productCode: string;
  productId: number;
  totalRevenue: number;
  productName: string;
  totalSold: number;
}

export interface IStatisticsResponse extends IApiResponse<IStatisticsItem> { }

export interface IRevenueReportResponse extends IApiResponse<IRevenuePeriod[]> { }

export interface ITopProductsResponse extends IApiResponse<ITopProductItem[]> { }

export interface IStatisticsDetailResponse extends IApiResponse<any> { }

export interface IGenerateDailyResponse extends IApiResponse<any> { }