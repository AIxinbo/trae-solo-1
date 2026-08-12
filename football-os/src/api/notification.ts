/**
 * 通知相关 API
 */
import { http } from './client'
import type { NotificationItem } from './types'

export const notificationApi = {
  list: (unreadOnly?: boolean) => http.get<NotificationItem[]>('/notifications', { unreadOnly }),

  unreadCount: () => http.get<number>('/notifications/unread-count'),

  create: (data: Partial<NotificationItem>) => http.post<NotificationItem>('/notifications', data),

  markRead: (id: string) => http.put<void>(`/notifications/${id}/read`),

  markAllRead: () => http.put<void>('/notifications/read-all'),
}
