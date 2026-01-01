import { IApiResponse, IApiListResponse } from '../common';

interface IAttributeBase {
  id: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface IBrand extends IAttributeBase {
  name: string;
}

export interface IBrandResponse extends IApiResponse<IBrand> {}

export interface IBrandsResponse extends IApiListResponse<IBrand> {}

export interface ICategory extends IAttributeBase {
  name: string;
}

export interface ICategoryResponse extends IApiResponse<ICategory> {}

export interface ICategoriesResponse extends IApiListResponse<ICategory> {}

export interface IMaterial extends IAttributeBase {
  name: string;
}

export interface IMaterialResponse extends IApiResponse<IMaterial> {}

export interface IMaterialsResponse extends IApiListResponse<IMaterial> {}

export interface IColor extends IAttributeBase {
  name: string;
  code: string;
}

export interface IColorResponse extends IApiResponse<IColor> {}

export interface IColorsResponse extends IApiListResponse<IColor> {}

export interface ISize extends IAttributeBase {
  value: number;
}

export interface ISizeResponse extends IApiResponse<ISize> {}

export interface ISizesResponse extends IApiListResponse<ISize> {}

export interface IActionResponse extends IApiResponse<any> {}