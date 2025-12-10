import { IAddress } from "../request/account"

export interface IBaseResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface IAccountData {
  id: string
  code: string
  fullName: string
  email: string
  role: string
}

export interface IAuthData {
  id: string
  fullName: string
  email: string
  role: string
  token: string
  account: IAccountData
}

export interface IAuthResponse extends IBaseResponse<IAuthData> {}

export interface IProfileData {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  avatar: string
}

export interface IProfileResponse extends IBaseResponse<IProfileData> {}

