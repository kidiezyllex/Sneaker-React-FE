export interface IAccountFilter {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IAccountCreate {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role?: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  gender?: boolean;
  birthday?: string | Date;
  citizenId?: string;
}

export interface IAccountUpdate {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: boolean;
  birthday?: string | Date;
  citizenId?: string;
  avatar?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface IAccountStatusUpdate {
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IAddress {
  id?: number | string;
  name: string;
  phoneNumber: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  specificAddress: string;
  type: boolean;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAddressCreate {
  name: string;
  phoneNumber: string;
  provinceId: string;
  districtId: string;
  wardId: string;
  specificAddress: string;
  type: boolean;
  isDefault: boolean;
}

export interface IAddressUpdate extends Partial<IAddressCreate> {}

export interface IProfileUpdate {
  fullName?: string;
  phoneNumber?: string;
  gender?: boolean;
  birthday?: string | Date;
  avatar?: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}