import api from './api';
import type { PagedResult } from './identity';

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: number;
  severity: number;
  data?: string;
  targetUrl?: string;
  creationTime: string;
  creatorId?: string;
}

export interface UserNotificationDto {
  id: string;
  notificationId: string;
  state: number;
  readTime?: string;
  creationTime: string;
  notification: NotificationDto;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: number;
  severity?: number;
  data?: string;
  targetUrl?: string;
  targetUserIds?: string[];
}

export const getNotifications = (params?: { skipCount?: number; maxResultCount?: number; state?: number }) =>
  api.get<PagedResult<UserNotificationDto>>('/api/app/notification', { params });

export const getUnreadCount = () =>
  api.get<number>('/api/app/notification/unread-count');

export const markAsRead = (id: string) =>
  api.post(`/api/app/notification/${id}/mark-as-read`);

export const markAllAsRead = () =>
  api.post('/api/app/notification/mark-all-as-read');

export const sendNotification = (data: CreateNotificationDto) =>
  api.post<NotificationDto>('/api/app/notification/send', data);

export const deleteNotification = (id: string) =>
  api.delete(`/api/app/notification/${id}`);
