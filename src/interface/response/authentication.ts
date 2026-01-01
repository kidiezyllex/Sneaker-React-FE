import { IAddress } from "../request/account"
import { IApiResponse, IBaseResponse } from "../common"

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

export interface IAuthResponse extends IApiResponse<IAuthData> {}

export interface IProfileData {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  avatar: string
}

export interface IProfileResponse extends IApiResponse<IProfileData> {}

// Legacy responses (for backward compatibility)
export interface ILegacyAuthResponse extends IBaseResponse<IAuthData> {}
export interface ILegacyProfileResponse extends IBaseResponse<IProfileData> {}

