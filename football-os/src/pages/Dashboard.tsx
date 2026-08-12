import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import { matchApi, playerApi, trainingApi, injuryApi, type MatchItem, type Player } from '../api'

interface Todo {
  id: number
  text: string
  time: string
  priority: 'high' | 'mid' | 'low'
  done: boolean
}

const INITIAL_TODOS: Todo[] = [
  { id: 1, text: '审核今日训练计划（体能强化）', time: '13:30', priority: 'high', done: false },
  { id: 2, text: '#9 球员伤病风险评估', time: '14:00', priority: 'high', done: false },
  { id: 3, text: '周日赛事首发名单确认', time: '16:00', priority: 'mid', done: false },
  { id: 4, text: '青训梯队周报审阅', time: '17:00', priority: 'low', done: false },
  { id: 5, text: '对手近 3 场录像分析', time: '18:00', priority: 'mid', done: false },
]

const FALLBACK_MATCHES = [
  { day: '20', month: '7月', name: 'vs 海港 FC', sub: '中超第 19 轮', tag: '主场', tagBg: 'color-mix(in srgb, var(--primary) 15%, transparent)', tagColor: 'var(--primary)', time: '周日 19:30', status: 'upcoming' },
  { day: '24', month: '7月', name: 'vs 申花联', sub: '足协杯 1/4', tag: '客场', tagBg: 'color-mix(in srgb, var(--secondary) 15%, transparent)', tagColor: 'var(--secondary)', time: '周四 19:35', status: 'upcoming' },
  { day: '14', month: '7月', name: 'vs 泰达雄狮', sub: '中超第 18 轮', tag: '已结束', tagBg: 'var(--card-elevated)', tagColor: 'var(--muted-foreground)', time: '2:1 胜', status: 'done', timeColor: 'var(--success)' },
]

const KEY_PLAYERS = [
  { no: 9, name: '张志远', status: '膝伤观察中', color: 'var(--destructive)' },
  { no: 4, name: '王浩', status: '负荷偏高', color: 'color-mix(in srgb, var(--primary) 60%, var(--success))' },
  { no: 11, name: '李明轩', status: '状态良好', color: 'var(--success)' },
]

const priorityStyle = (p: Todo['priority']) => {
  if (p === 'high') return { bg: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }
  if (p === 'mid') return { bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)', color: 'var(--secondary)' }
  return { bg: 'var(--card-elevated)', color: 'var(--muted-foreground)' }
}
const priorityLabel = (p: Todo['priority']) => (p === 'high' ? '高' : p === 'mid' ? '中' : '低')

function formatMatch(m: MatchItem) {
  const d = new Date(m.matchDate)
  const day = String(d.getDate())
  const month = `${d.getMonth() + 1}月`
  const isDone = m.status === 'finished'
  const isHome = m.homeAway !== 'away'
  const tag = isDone ? '已结束' : isHome ? '主场' : '客场'
  const tagBg = isDone
    ? 'var(--card-elevated)'
    : isHome
      ? 'color-mix(in srgb, var(--primary) 15%, transparent)'
      : 'color-mix(in srgb, var(--secondary) 15%, transparent)'
  const tagColor = isDone ? 'var(--muted-foreground)' : isHome ? 'var(--primary)' : 'var(--secondary)'
  const time = isDone ? `${m.scoreHome}:${m.scoreAway}` : `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  return {
    day,
    month,
    name: `vs ${m.opponent}`,
    sub: m.venue || '',
    tag,
    tagBg,
    tagColor,
    time,
    status: isDone ? 'done' : 'upcoming',
    timeColor: isDone ? 'var(--success)' : undefined,
  }
}

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS)
  const [matches, setMatches] = useState(FALLBACK_MATCHES)
  const [players, setPlayers] = useState<Player[]>([])
  const [todayTrainings, setTodayTrainings] = useState<number>(1)
  const [injuryCount, setInjuryCount] = useState(2)

  useEffect(() => {
    matchApi.recent(3).then((list) => {
      if (list && list.length > 0) setMatches(list.map(formatMatch))
    }).catch(() => {})
    playerApi.all().then(setPlayers).catch(() => {})
    trainingApi.today().then((list) => setTodayTrainings(list.length)).catch(() => {})
    injuryApi.active().then((list) => setInjuryCount(list.length)).catch(() => {})
  }, [])

  const playerCount = players.length || 28
  const healthyCount = playerCount - injuryCount

  const KPIS = [
    { icon: Users, iconColor: 'var(--secondary)', badge: '在队', badgeBg: 'color-mix(in srgb, var(--success) 15%, transparent)', badgeColor: 'var(--success)', value: String(playerCount), label: '在队球员', sub: `${playerCount} 人`, subColor: 'var(--success)' },
    { icon: Dumbbell, iconColor: 'var(--primary)', badge: '今日', badgeBg: 'color-mix(in srgb, var(--primary) 15%, transparent)', badgeColor: 'var(--primary)', value: String(todayTrainings), label: '今日训练场次', sub: todayTrainings > 0 ? '今日安排' : '无安排', subColor: 'var(--primary)' },
    { icon: Trophy, iconColor: 'var(--secondary)', badge: '近期', badgeBg: 'color-mix(in srgb, var(--secondary) 15%, transparent)', badgeColor: 'var(--secondary)', value: String(matches.length), label: '近期赛事', sub: '查看详情', subColor: 'var(--secondary)' },
    { icon: HeartPulse, iconColor: 'var(--success)', badge: injuryCount > 0 ? `${injuryCount} 伤` : '全健康', badgeBg: injuryCount > 0 ? 'color-mix(in srgb, var(--destructive) 15%, transparent)' : 'color-mix(in srgb, var(--success) 15%, transparent)', badgeColor: injuryCount > 0 ? 'var(--destructive)' : 'var(--success)', value: String(healthyCount), label: '健康球员 / 总数', sub: injuryCount > 0 ? `${injuryCount} 人伤病` : '全员健康', subColor: injuryCount > 0 ? 'var(--destructive)' : 'var(--success)' },
  ]

  const MATCHES = matches

  const toggleTodo = (id: number) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const completedCount = todos.filter((t) => t.done).length
  const totalCount = todos.length

  return (
    <AppShell>
      {/* Welcome */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            早上好，李教练
          </h2>
          <p className="text-sm mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>
            今日有 1 场训练 + 周末主场赛事准备
          </p>
        </div>
        <div
          className="px-3 py-2 rounded-md flex items-center gap-2 shrink-0"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-xs whitespace-nowrap mono" style={{ color: 'var(--muted-foreground)' }}>
            2026年7月18日 周六
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-lg p-4 sm:p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2">
              <k.icon className="w-5 h-5 shrink-0" style={{ color: k.iconColor }} />
              <span
                className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap mono"
                style={{ background: k.badgeBg, color: k.badgeColor }}
              >
                {k.badge}
              </span>
            </div>
            <div className="text-3xl font-bold mt-3 whitespace-nowrap mono" style={{ color: 'var(--foreground)' }}>
              {k.value}
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                {k.label}
              </span>
              <span className="text-xs whitespace-nowrap mono" style={{ color: k.subColor }}>
                {k.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Todos */}
          <div className="rounded-lg p-5 sm:p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                今日待办
              </h3>
              <span className="text-xs whitespace-nowrap mono" style={{ color: 'var(--muted-foreground)' }}>
                {completedCount} / {totalCount}
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-4">
              {todos.map((t) => {
                const ps = priorityStyle(t.priority)
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTodo(t.id)}
                    className="flex items-start gap-3 py-2 text-left rounded-md transition-colors hover:bg-[var(--card-elevated)] px-2 -mx-2"
                  >
                    <span
                      className="w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        border: t.done ? '1px solid var(--success)' : '1px solid var(--border)',
                        background: t.done ? 'var(--success)' : 'transparent',
                      }}
                    >
                      {t.done && <Check className="w-3 h-3" style={{ color: 'var(--background)' }} />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm truncate transition-colors"
                        style={{
                          color: t.done ? 'var(--muted-foreground)' : 'var(--foreground)',
                          textDecoration: t.done ? 'line-through' : 'none',
                        }}
                      >
                        {t.text}
                      </div>
                      <div className="text-xs mt-0.5 whitespace-nowrap mono" style={{ color: 'var(--muted-foreground)' }}>
                        {t.time}
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                      style={{ background: ps.bg, color: ps.color }}
                    >
                      {priorityLabel(t.priority)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent matches */}
          <div className="rounded-lg p-5 sm:p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                近期赛事
              </h3>
              <Link
                to="/app/match"
                className="text-xs flex items-center gap-1 whitespace-nowrap transition hover:brightness-110"
                style={{ color: 'var(--secondary)' }}
              >
                <span>进入赛事中心</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex flex-col mt-4">
              {MATCHES.map((m, i) => (
                <div
                  key={m.day + m.name}
                  className="flex items-center gap-4 py-3"
                  style={{ borderBottom: i < MATCHES.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <div className="w-12 text-center shrink-0">
                    <div className="text-xl mono" style={{ color: 'var(--foreground)' }}>{m.day}</div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{m.month}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{m.name}</div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>{m.sub}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: m.tagBg, color: m.tagColor }}
                    >
                      {m.tag}
                    </span>
                    <span
                      className="text-xs whitespace-nowrap mono"
                      style={{ color: (m as { timeColor?: string }).timeColor ?? 'var(--muted-foreground)' }}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          {/* Player status */}
          <div className="rounded-lg p-5 sm:p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
                球员状态
              </h3>
              <Link
                to="/app/players"
                className="text-xs whitespace-nowrap transition hover:brightness-110"
                style={{ color: 'var(--secondary)' }}
              >
                查看全部
              </Link>
            </div>
            <div
              className="w-24 h-24 mx-auto mt-4 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'conic-gradient(var(--success) 0 82%, var(--destructive) 82% 93%, var(--muted-foreground) 93% 100%)' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--card)' }}>
                <span className="text-xl font-bold mono" style={{ color: 'var(--foreground)' }}>28</span>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-3 flex-wrap">
              <span className="text-xs flex items-center gap-1.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--success)' }} />健康 23
              </span>
              <span className="text-xs flex items-center gap-1.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--destructive)' }} />观察 3
              </span>
              <span className="text-xs flex items-center gap-1.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--muted-foreground)' }} />休战 2
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {KEY_PLAYERS.map((p) => (
                <div key={p.no} className="flex items-center gap-3 py-2">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center shrink-0 mono"
                    style={{ background: 'var(--card-elevated)', fontSize: '12px', color: 'var(--foreground)' }}
                  >
                    {p.no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--foreground)' }}>{p.name}</div>
                  </div>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  <span className="text-xs whitespace-nowrap shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI advisor card */}
          <Link
            to="/app/tactics"
            className="rounded-lg p-5 block transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--card-elevated)',
              border: '1px solid color-mix(in srgb, var(--secondary) 30%, transparent)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-[18px] h-[18px] shrink-0" style={{ color: 'var(--secondary)' }} />
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                  FC·AI 参谋
                </span>
              </div>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--success)' }} title="在线" />
            </div>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              基于今日数据，#9 号球员膝部负荷指数 78（警戒线 75），建议今日训练减量 30%，并在赛前评估出场时间。
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {['生成今日训练建议', '分析对手右路', '推荐首发 11 人', '本周伤病风险'].map((q) => (
                <span
                  key={q}
                  className="h-8 px-3 rounded-full text-xs whitespace-nowrap flex items-center justify-center"
                  style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                >
                  {q}
                </span>
              ))}
            </div>
            <div
              className="h-9 px-3 rounded-full mt-4 flex items-center gap-2"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              <Bell className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-xs flex-1 truncate" style={{ color: 'var(--muted-foreground)' }}>
                点击顶部「AI 参谋」打开对话
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Tactics CTA */}
      <Link
        to="/app/tactics"
        className="rounded-lg p-5 sm:p-6 mt-4 sm:mt-6 flex items-center justify-between gap-4 flex-wrap transition-all hover:-translate-y-0.5"
        style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <Target className="w-7 h-7 shrink-0" style={{ color: 'var(--primary)' }} />
          <div className="min-w-0">
            <div className="text-base font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
              进入沉浸式战术看板
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
              布阵、推演、实时数据叠加
            </div>
          </div>
        </div>
        <button
          className="h-10 px-5 rounded-full flex items-center gap-2 text-sm font-medium whitespace-nowrap shrink-0 transition hover:brightness-110"
          style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
        >
          <span>打开战术看板</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </AppShell>
  )
}
