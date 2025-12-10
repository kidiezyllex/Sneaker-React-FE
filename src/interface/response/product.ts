import { IProductVariant } from "../request/product";

export interface IBrand {
  id: string;
  name: string;
}

export interface ICategory {
  id: string;
  name: string;
}

export interface IMaterial {
  id: string;
  name: string;
}

export interface IColor {
  id: string;
  name: string;
  code: string;
}

export interface ISize {
  id: string;
  name?: string;
  code?: string;
  value: number;
}

export interface IProductImage {
  id: number;
  imageUrl: string;
}

export interface IPopulatedProductVariant {
  id: string;
  colorId: string;
  sizeId: string;
  color: IColor;
  size: ISize;
  price: number;
  stock: number;
  images: IProductImage[];
}

export interface IProduct {
  id: string;
  code: string;
  name: string;
  brand: string | IBrand;
  category: string | ICategory;
  material: string | IMaterial;
  description: string;
  weight: number;
  variants: IPopulatedProductVariant[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  price: number;
}

export interface IProductResponse {
  success: boolean;
  message: string;
  data: IProduct;
}

export interface IProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: IProduct[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export interface IActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IPriceRange {
  min: number;
  max: number;
}

export interface IProductFiltersResponse {
  success: boolean;
  message: string;
  data: {
    brands: IBrand[];
    categories: ICategory[];
    materials: IMaterial[];
    colors: IColor[];
    sizes: ISize[];
    priceRange: IPriceRange;
  };
} 