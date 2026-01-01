import {
  ISignIn,
  IRegister
} from "@/interface/request/authentication";

import {
  IAuthResponse,
  IProfileResponse
} from "@/interface/response/authentication";

import { sendGet, sendPost } from "./axios";

export const register = async (payload: IRegister): Promise<IAuthResponse> => {
  const res = await sendPost("/auth/register", payload);
  return res as IAuthResponse;
};

export const login = async (payload: ISignIn): Promise<IAuthResponse> => {
  const res = await sendPost("/auth/login", payload);
  return res as IAuthResponse;
};

export const logout = async (): Promise<{success: boolean; message: string}> => {
  const res = await sendPost("/auth/logout", {});
  return res;
};

export const getCurrentUser = async (): Promise<IProfileResponse> => {
  const res = await sendGet("/auth/me");
  return res as IProfileResponse;
};

export const refreshToken = async (
  payload: { refreshToken: string }
): Promise<{ success: boolean; data: { token: string; refreshToken: string } }> => {
  const res = await sendPost("/auth/refresh-token", payload);
  return res;
};
