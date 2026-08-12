import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Activity, ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react'
import { authApi } from '../api'
import { useAuth, cacheUserAfterLogin } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: string })?.from || '/app/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const vo = await authApi.login({ username: username.trim(), password })
      cacheUserAfterLogin(vo)
      setUser({
        userId: vo.userId,
        username: vo.username,
        realName: vo.realName,
        role: vo.role,
        avatar: vo.avatar,
      })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left brand panel (desktop) */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--primary) 25%, transparent), transparent 60%), radial-gradient(circle at 70% 80%, color-mix(in srgb, var(--secondary) 18%, transparent), transparent 55%), var(--card)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
          >
            <Activity className="w-5 h-5" style={{ color: 'var(--on-accent)' }} />
          </span>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            FC·INTELLIGENCE
          </span>
        </div>

        <div className="relative z-10">
          <h1
            className="text-4xl font-bold leading-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            数据驱动的
            <br />
            足球智慧平台
          </h1>
          <p className="text-base mt-4 max-w-md leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            战术看板、赛事指挥、训练计划、球员档案与 AI 参谋一体化。让每一次首发、换人、训练计划都有据可依。
          </p>
          <div className="flex gap-6 mt-8">
            {[
              { v: '28', l: '在队球员' },
              { v: '4-3-3', l: '战术阵型' },
              { v: 'AI', l: '智能参谋' },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-bold mono" style={{ color: 'var(--secondary)' }}>
                  {s.v}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          © 2026 FC·INTELLIGENCE · 体育俱乐部智慧管理平台
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <span
              className="w-9 h-9 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            >
              <Activity className="w-5 h-5" style={{ color: 'var(--on-accent)' }} />
            </span>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              FC·INTELLIGENCE
            </span>
          </div>

          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            欢迎回来
          </h2>
          <p className="text-sm mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
            登录进入教练工作台
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
                用户名
              </label>
              <div
                className="h-11 px-3 rounded-md flex items-center gap-2"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <User className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  autoComplete="username"
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm"
                  style={{ color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
                密码
              </label>
              <div
                className="h-11 px-3 rounded-md flex items-center gap-2"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <Lock className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm"
                  style={{ color: 'var(--foreground)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors hover:bg-[var(--card-elevated)]"
                  style={{ color: 'var(--muted-foreground)' }}
                  aria-label={showPwd ? '隐藏密码' : '显示密码'}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="px-3 py-2 rounded-md text-xs"
                style={{
                  background: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)',
                  color: 'var(--destructive)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'color-mix(in srgb, var(--on-accent) 30%, transparent)', borderTopColor: 'var(--on-accent)' }}
                  />
                  登录中…
                </span>
              ) : (
                <>
                  <span>登录</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs">
            <Link to="/" style={{ color: 'var(--muted-foreground)' }} className="hover:text-[var(--foreground)] transition-colors">
              ← 返回首页
            </Link>
            <span style={{ color: 'var(--muted-foreground)' }}>
              忘记密码？联系管理员
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
