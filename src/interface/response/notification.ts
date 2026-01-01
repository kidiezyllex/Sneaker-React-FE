import { IApiResponse, IApiListResponse } from "../common";

export interface INotification {
  id: string;
  type: 'EMAIL' | 'SYSTEM';
  title: string;
  content: string;
  recipients: {
    id: string;
    fullName?: string;
    email?: string;
  }[];
  relatedTo: 'VOUCHER' | 'ORDER' | 'PROMOTION' | 'SYSTEM';
  relatedId: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface INotificationResponse extends IApiResponse<INotification> {}

export interface INotificationsResponse extends IApiListResponse<INotification> {}

export interface IActionResponse extends IApiResponse<any> {}