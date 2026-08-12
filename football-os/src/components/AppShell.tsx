import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Shield,
  Sparkles,
  Target,
  Users,
  X,
  ArrowUp,
  Send,
} from 'lucide-react'
import { notificationApi } from '../api'
import { useAuth } from '../context/AuthContext'
import NotificationCenter from './NotificationCenter'

const NAV = [
  { to: '/app/dashboard', label: '工作台', icon: LayoutDashboard },
  { to: '/app/tactics', label: '战术看板', icon: Target },
  { to: '/app/match', label: '赛事指挥', icon: Activity },
  { to: '/app/training', label: '训练计划', icon: Calendar },
  { to: '/app/players', label: '球员档案', icon: Users },
  { to: '/app/teams', label: '球队管理', icon: Shield },
] as const

const PAGE_TITLE: Record<string, string> = {
  '/app/dashboard': '工作台',
  '/app/tactics': '战术看板',
  '/app/match': '赛事指挥',
  '/app/training': '训练计划',
  '/app/players': '球员档案',
  '/app/teams': '球队管理',
}

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const title = PAGE_TITLE[location.pathname] ?? '工作台'

  const refreshUnread = () => {
    notificationApi.unreadCount().then(setUnreadCount).catch(() => {})
  }

  useEffect(() => {
    refreshUnread()
    const timer = setInterval(refreshUnread, 60000)
    return () => clearInterval(timer)
  }, [])

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  return (
    <div className="h-screen overflow-hidden flex" data-viewport-mode="app-shell">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-[240px] h-screen shrink-0 flex-col" style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Sidebar (mobile drawer) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] flex flex-col" style={{ background: 'var(--card)' }}>
            <button
              className="absolute right-3 top-4 z-10 w-8 h-8 rounded-md flex items-center justify-center"
              style={{ color: 'var(--muted-foreground)' }}
              onClick={() => setMobileNavOpen(false)}
              aria-label="关闭导航"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Right column: header + main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 shrink-0 flex items-center px-4 sm:px-6 gap-3 sm:gap-4"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            className="md:hidden w-9 h-9 rounded-md flex items-center justify-center"
            style={{ color: 'var(--muted-foreground)' }}
            onClick={() => setMobileNavOpen(true)}
            aria-label="打开导航"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base sm:text-lg font-semibold shrink-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            {title}
          </h1>
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="h-9 px-3 rounded-md flex items-center gap-2" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="搜索球员、赛事、训练计划…"
                className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative w-9 h-9 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--card-elevated)]"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label="通知"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-bold mono"
                  style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button
              className="h-9 px-3 sm:px-4 rounded-md flex items-center gap-1.5 text-sm transition hover:brightness-110"
              style={{
                background: 'color-mix(in srgb, var(--secondary) 12%, var(--card))',
                border: '1px solid color-mix(in srgb, var(--secondary) 40%, transparent)',
                color: 'var(--secondary)',
              }}
              onClick={() => setAiOpen(true)}
            >
              <Sparkles className="w-4 h-4" />
              <span className="whitespace-nowrap hidden sm:inline">AI 参谋</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0" style={{ background: 'var(--background)' }}>
          {children}
        </div>
      </div>

      {/* AI Advisor drawer */}
      {aiOpen && <AiAdvisorDrawer onClose={() => setAiOpen(false)} />}

      {/* Notification Center drawer */}
      {notifOpen && (
        <NotificationCenter
          onClose={() => {
            setNotifOpen(false)
            refreshUnread()
          }}
        />
      )}
    </div>
  )
}

function SidebarContent() {
  return (
    <>
      <NavLink to="/" className="h-16 px-6 flex items-center gap-2 shrink-0">
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
        >
          <Activity className="w-4 h-4" style={{ color: 'var(--on-accent)' }} />
        </span>
        <span className="text-sm tracking-tight truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
          FC·INTELLIGENCE
        </span>
      </NavLink>
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 min-h-0 overflow-y-auto no-scrollbar">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? '' : 'hover:text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--card-elevated)_50%,transparent)]'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? { color: 'var(--foreground)', background: 'color-mix(in srgb, var(--primary) 8%, var(--card))' }
                : { color: 'var(--muted-foreground)' }
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
                    style={{ background: 'var(--primary)' }}
                  />
                )}
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
        <div
          className="p-3 rounded-lg"
          style={{
            background: 'color-mix(in srgb, var(--secondary) 8%, var(--card))',
            border: '1px solid color-mix(in srgb, var(--secondary) 30%, transparent)',
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-[18px] h-[18px] shrink-0" style={{ color: 'var(--secondary)' }} />
            <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
              AI 参谋
            </span>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            随时提问战术与数据
          </p>
          <button
            className="mt-2.5 w-full h-7 rounded-md text-xs font-medium transition hover:brightness-110"
            style={{ background: 'color-mix(in srgb, var(--secondary) 18%, transparent)', color: 'var(--secondary)' }}
          >
            打开对话
          </button>
        </div>
      </nav>
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <SidebarUser />
      </div>
    </>
  )
}

function SidebarUser() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const name = user?.realName || user?.username || '未登录'
  const role = user?.role || ''
  const roleLabel = role === 'admin' ? '管理员' : role === 'coach' ? '主教练' : role || '用户'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden" style={{ background: 'var(--card-elevated)' }}>
        {user?.avatar ? (
          <img src={user.avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <Users className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate" style={{ color: 'var(--foreground)' }}>
          {name}
        </div>
        <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
          {roleLabel}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--card-elevated)]"
        style={{ color: 'var(--muted-foreground)' }}
        aria-label="退出登录"
        title="退出登录"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ChatMsg {
  role: 'user' | 'ai'
  text: string
}

const QUICK_PROMPTS = [
  '生成今日训练建议',
  '分析对手右路',
  '推荐首发 11 人',
  '本周伤病风险',
]

function AiAdvisorDrawer({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'ai',
      text: '基于今日数据，#9 号球员膝部负荷指数 78（警戒线 75），建议今日训练减量 30%，并在赛前评估出场时间。',
    },
  ])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `已收到「${trimmed}」的请求。基于近期 5 场赛事与训练数据，相关建议已生成，可在战术看板或球员档案中查看完整分析。`,
        },
      ])
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] flex flex-col"
        style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)' }}
      >
        <div className="h-16 px-5 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-[18px] h-[18px] shrink-0" style={{ color: 'var(--secondary)' }} />
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              FC·AI 参谋
            </span>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--success)' }} title="在线" />
          </div>
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ color: 'var(--muted-foreground)' }}
            onClick={onClose}
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] p-3 rounded-lg text-sm leading-relaxed"
                style={
                  m.role === 'user'
                    ? { background: 'var(--primary)', color: 'var(--on-accent)' }
                    : { background: 'var(--card-elevated)', color: 'var(--foreground)' }
                }
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                className="h-7 px-3 rounded-full text-xs whitespace-nowrap transition hover:border-[var(--secondary)]"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                onClick={() => send(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="h-10 px-3 rounded-full flex items-center gap-2" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
            <MessageSquare className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send(input)
              }}
              placeholder="向 AI 参谋提问…"
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm"
              style={{ color: 'var(--foreground)' }}
            />
            <button
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition hover:brightness-110"
              style={{ background: 'var(--secondary)', color: 'var(--on-accent)' }}
              onClick={() => send(input)}
              aria-label="发送"
            >
              {input.trim() ? <Send className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
