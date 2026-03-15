import api from './api';
import type { PagedResult } from './identity';

export interface ChatMessageDto {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  message: string;
  isRead: boolean;
  readTime?: string;
  creationTime: string;
}

export interface ChatContactDto {
  userId: string;
  userName: string;
  name?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export const getContacts = () =>
  api.get<ChatContactDto[]>('/api/app/chat/contacts');

export const getMessages = (contactId: string, params?: { skipCount?: number; maxResultCount?: number }) =>
  api.get<PagedResult<ChatMessageDto>>('/api/app/chat/messages', { params: { contactId, ...params } });

export const sendMessage = (receiverId: string, message: string) =>
  api.post<ChatMessageDto>('/api/app/chat/send-message', { receiverId, message });

export const markAsRead = (contactId: string) =>
  api.post(`/api/app/chat/mark-as-read?contactId=${contactId}`);
