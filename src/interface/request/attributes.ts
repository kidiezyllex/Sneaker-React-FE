export interface IBrandFilter {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface IBrandCreate {
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IBrandUpdate {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ICategoryFilter {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface ICategoryCreate {
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ICategoryUpdate {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface IMaterialFilter {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface IMaterialCreate {
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IMaterialUpdate {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface IColorFilter {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface IColorCreate {
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IColorUpdate {
  name?: string;
  code?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface ISizeFilter {
  value?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface ISizeCreate {
  value: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ISizeUpdate {
  value?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}