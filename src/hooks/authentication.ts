import {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken
} from "@/api/authentication";
import type {
  ISignIn,
  IRegister,
} from "@/interface/request/authentication";
import type {
  IAuthResponse,
  IProfileResponse
} from "@/interface/response/authentication";
import {
  type UseMutationResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import cookies from "js-cookie";
import { useChangePassword, useUpdateUserProfile } from './account';
export const useLogin = (): UseMutationResult<
  IAuthResponse,
  Error,
  ISignIn
> => {
  return useMutation<IAuthResponse, Error, ISignIn>({
    mutationFn: (params: ISignIn) => login(params),
    onSuccess: (result: IAuthResponse) => {
      if (result.success && result.data.token) {
        cookies.set("accessToken", result.data.token);
      }
      return result;
    },
  });
};

export const useRegister = (): UseMutationResult<
  IAuthResponse,
  Error,
  IRegister
> => {
  return useMutation<IAuthResponse, Error, IRegister>({
    mutationFn: (params: IRegister) => register(params),
  });
};

export const useLogout = (): UseMutationResult<
  {success: boolean; message: string},
  Error,
  void
> => {
  return useMutation<{success: boolean; message: string}, Error, void>({
    mutationFn: () => logout(),
    onSuccess: () => {
      cookies.remove("accessToken");
      localStorage.clear();
    },
  });
};

export const useCurrentUser = () => {
  const {
    data: userData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<IProfileResponse, Error>({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    enabled: typeof window !== 'undefined' && (!!cookies.get("accessToken")),
  });

  return {
    userData,
    isLoading,
    isFetching,
    refetch,
  };
};

export const useRefreshToken = (): UseMutationResult<
  {success: boolean; data: {token: string; refreshToken: string}},
  Error,
  {refreshToken: string}
> => {
  return useMutation<
    {success: boolean; data: {token: string; refreshToken: string}},
    Error,
    {refreshToken: string}
  >({
    mutationFn: (params: {refreshToken: string}) => refreshToken(params),
    onSuccess: (result) => {
      if (result.success && result.data.token) {
        cookies.set("accessToken", result.data.token);
      }
      return result;
    },
  });
};

export { useChangePassword, useUpdateUserProfile as useUpdateProfile };
