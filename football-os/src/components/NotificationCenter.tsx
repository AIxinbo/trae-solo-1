import { useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { notificationApi, type NotificationItem } from '../api'

interface NotificationCenterProps {
  onClose: () => void
}

const TYPE_COLOR: Record<string, string> = {
  match: 'var(--primary)',
  training: 'var(--secondary)',
  injury: 'var(--destructive)',
  system: 'var(--muted-foreground)',
}

function formatTime(time: string): string {
  try {
    const d = new Date(time)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return '刚刚'
    if (min < 60) return `${min} 分钟前`
    const hour = Math.floor(min / 60)
    if (hour < 24) return `${hour} 小时前`
    const day = Math.floor(hour / 24)
    if (day < 7) return `${day} 天前`
    return d.toLocaleDateString('zh-CN')
  } catch {
    return time
  }
}

export default function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterUnread, setFilterUnread] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [list, count] = await Promise.all([
        notificationApi.list(filterUnread || undefined),
        notificationApi.unreadCount(),
      ])
      setNotifications(list)
      setUnreadCount(count)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUnread])

  const markRead = async (id: string) => {
    try {
      await notificationApi.markRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: 1 } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // ignore
    }
  }

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 1 })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] flex flex-col"
        style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="h-16 px-5 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Bell className="w-[18px] h-[18px] shrink-0" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              通知中心
            </span>
            {unreadCount > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap mono"
                style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--card-elevated)] disabled:opacity-40"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label="全部已读"
              title="全部标记已读"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--card-elevated)]"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-5 py-3 flex gap-2 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setFilterUnread(false)}
            className="h-7 px-3 rounded-full text-xs whitespace-nowrap transition"
            style={
              !filterUnread
                ? { background: 'var(--primary)', color: 'var(--on-accent)' }
                : { border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
            }
          >
            全部
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className="h-7 px-3 rounded-full text-xs whitespace-nowrap transition"
            style={
              filterUnread
                ? { background: 'var(--primary)', color: 'var(--on-accent)' }
                : { border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
            }
          >
            未读 {unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
              />
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 p-6">
              <Bell className="w-8 h-8" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                暂无通知
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => {
                const color = TYPE_COLOR[n.type] || 'var(--muted-foreground)'
                return (
                  <div
                    key={n.id}
                    className="px-5 py-4 flex gap-3 transition-colors hover:bg-[var(--card-elevated)] group"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ background: n.isRead ? 'var(--border)' : color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap"
                          style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
                        >
                          {n.type}
                        </span>
                        {!n.isRead && (
                          <span className="text-xs" style={{ color: 'var(--primary)' }}>
                            新
                          </span>
                        )}
                      </div>
                      <div
                        className="text-sm font-medium mt-1.5 truncate"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {n.title}
                      </div>
                      <div
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {n.content}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span
                          className="text-xs whitespace-nowrap mono"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          {formatTime(n.createTime)}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                            style={{ color: 'var(--secondary)' }}
                          >
                            <Check className="w-3 h-3" />
                            标记已读
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
