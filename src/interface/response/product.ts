import { IProductVariant } from "../request/product";
import { IApiResponse, IApiListResponse } from "../common";

export interface IBrand {
  id: number;
  name: string;
}

export interface ICategory {
  id: number;
  name: string;
}

export interface IMaterial {
  id: number;
  name: string;
}

export interface IColor {
  id: number;
  name: string;
  code: string;
}

export interface ISize {
  id: number;
  name?: string;
  code?: string;
  value: number;
}

export interface IProductImage {
  id: number;
  imageUrl: string;
}

export interface IPopulatedProductVariant {
  id: number;
  color: IColor;
  size: ISize;
  price: number;
  stock: number;
  images: IProductImage[];
}

export interface IProduct {
  id: number;
  code: string;
  name: string;
  brand: IBrand;
  category: ICategory;
  material: IMaterial;
  description: string;
  weight: number;
  variants: IPopulatedProductVariant[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface IProductResponse extends IApiResponse<IProduct> {}

export interface IProductsResponse extends IApiListResponse<IProduct> {}

export interface IActionResponse extends IApiResponse<any> {}

export interface IPriceRange {
  min: number;
  max: number;
}

export interface IProductFilters {
  brands: IBrand[];
  sizes: ISize[];
  materials: IMaterial[];
  categories: ICategory[];
  priceRange: IPriceRange;
  colors: IColor[];
}

export interface IProductFiltersResponse extends IApiResponse<IProductFilters> {}