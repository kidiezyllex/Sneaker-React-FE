import { IApiResponse } from "../common";

export interface IUploadImageResponseData {
  url: string;
  publicId: string;
}

export interface IUploadImageResponse extends IApiResponse<IUploadImageResponseData> {}
