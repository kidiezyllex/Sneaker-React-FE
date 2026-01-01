import {
  IProductFilter,
  IProductCreate,
  IProductUpdate,
  IProductStatusUpdate,
  IProductStockUpdate,
  IProductImageUpdate,
  IProductSearchParams
} from "@/interface/request/product";

import {
  IProductsResponse,
  IProductResponse,
  IActionResponse,
  IProductFiltersResponse
} from "@/interface/response/product";

import { sendGet, sendPost, sendPut, sendPatch, sendDelete } from "./axios";

const convertParamsToQueryString = (params: any): any => {
  const formattedParams: any = {};

  for (const key in params) {
    if (params[key] !== undefined) {
      if (Array.isArray(params[key])) {
        formattedParams[key] = params[key].join(',');
      } else {
        formattedParams[key] = params[key];
      }
    }
  }

  return formattedParams;
};

export const getAllProducts = async (params: IProductFilter): Promise<IProductsResponse> => {
  const formattedParams = convertParamsToQueryString(params);
  const res = await sendGet("/products", formattedParams);
  return res as IProductsResponse;
};

export const getProductById = async (productId: string): Promise<IProductResponse> => {
  const res = await sendGet(`/products/${productId}`);
  return res as IProductResponse;
};

export const getProductImages = async (productId: string): Promise<any> => {
  const res = await sendGet(`/products/${productId}/images`);
  return res;
};

export const createProduct = async (payload: IProductCreate): Promise<IProductResponse> => {
  const res = await sendPost("/products", payload);
  return res as IProductResponse;
};

export const updateProduct = async (
  productId: string,
  payload: IProductUpdate
): Promise<IProductResponse> => {
  const res = await sendPut(`/products/${productId}`, payload);
  return res as IProductResponse;
};

export const updateProductStatus = async (
  productId: string,
  payload: IProductStatusUpdate
): Promise<IProductResponse> => {
  const res = await sendPatch(`/products/${productId}/status`, payload);
  return res as IProductResponse;
};

export const updateProductStock = async (
  productId: string,
  payload: IProductStockUpdate
): Promise<IProductResponse> => {
  const res = await sendPatch(`/products/${productId}/stock`, payload);
  return res as IProductResponse;
};

export const updateProductImages = async (
  productId: string,
  payload: IProductImageUpdate
): Promise<IProductResponse> => {
  const res = await sendPatch(`/products/${productId}/images`, payload);
  return res as IProductResponse;
};

export const deleteProduct = async (productId: string): Promise<IActionResponse> => {
  const res = await sendDelete(`/products/${productId}`);
  return res as IActionResponse;
};

export const searchProducts = async (params: IProductSearchParams): Promise<IProductsResponse> => {
  const formattedParams = convertParamsToQueryString(params);
  const res = await sendGet("/products/search", formattedParams);
  return res as IProductsResponse;
};

export const getAllFilters = async (): Promise<IProductFiltersResponse> => {
  const res = await sendGet("/products/filters");
  return res as IProductFiltersResponse;
};

export const getLatestProducts = async (): Promise<IProductsResponse> => {
  const res = await sendGet("/products/latest");
  return res as IProductsResponse;
};

export const getBestSellingProducts = async (): Promise<IProductsResponse> => {
  const res = await sendGet("/products/best-sellers");
  return res as IProductsResponse;
};
