import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CornerUpRight,
  Filter,
  Flag,
  GitBranch,
  History,
  MessageSquare,
  Repeat,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import { matchApi, type MatchItem as ApiMatch } from '../api'

type MatchStatus = 'live' | 'preparing' | 'upcoming' | 'finished'

interface MatchRow {
  id: string
  date: string
  opponent: string
  round: string
  venue: '主场' | '客场'
  status: MatchStatus
  result?: string
  resultTone?: 'success' | 'muted'
}

const FALLBACK_MATCHES: MatchRow[] = [
  { id: 'm1', date: '2026-07-20', opponent: 'vs 海港 FC', round: '中超第19轮', venue: '主场', status: 'live' },
  { id: 'm2', date: '2026-07-14', opponent: 'vs 泰达雄狮', round: '中超第18轮', venue: '主场', status: 'finished', result: '2:1 胜', resultTone: 'success' },
  { id: 'm3', date: '2026-07-24', opponent: 'vs 申花联', round: '足协杯1/4', venue: '客场', status: 'preparing' },
  { id: 'm4', date: '2026-07-28', opponent: 'vs 国安青训', round: '中超第20轮', venue: '主场', status: 'upcoming' },
  { id: 'm5', date: '2026-08-02', opponent: 'vs 鲁能泰山', round: '中超第21轮', venue: '客场', status: 'upcoming' },
]

function mapApiMatch(m: ApiMatch): MatchRow {
  const d = new Date(m.matchDate)
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const venue: '主场' | '客场' = m.homeAway === 'away' ? '客场' : '主场'
  let status: MatchStatus = 'upcoming'
  if (m.status === 'finished') status = 'finished'
  else if (m.status === 'live') status = 'live'
  else if (m.status === 'scheduled') status = 'preparing'
  const result = status === 'finished' ? `${m.scoreHome}:${m.scoreAway}` : undefined
  const resultTone: 'success' | 'muted' | undefined =
    status === 'finished' ? (m.scoreHome > m.scoreAway ? 'success' : 'muted') : undefined
  return {
    id: m.id,
    date: dateStr,
    opponent: `vs ${m.opponent}`,
    round: m.venue || '',
    venue,
    status,
    result,
    resultTone,
  }
}

type EventTone = 'attack' | 'defense' | 'neutral'

interface MatchEvent {
  id: string
  minute: string
  type: string
  desc: string
  sub?: string
  tone: EventTone
  icon: typeof Trophy
}

const EVENTS: MatchEvent[] = [
  { id: 'e1', minute: "63'", type: '进球', desc: '#10 李明轩 接 #7 王浩助攻破门', sub: '比分 2:1', tone: 'attack', icon: Trophy },
  { id: 'e2', minute: "58'", type: '换人', desc: '#19 张伟 替换 #9 张志远', sub: '战术调整', tone: 'neutral', icon: Repeat },
  { id: 'e3', minute: "52'", type: '黄牌', desc: '对方 #6 战术犯规', sub: '中场犯规', tone: 'defense', icon: Flag },
  { id: 'e4', minute: "47'", type: '射门', desc: '#7 王浩 右路内切射门偏出', sub: '本场第 8 射', tone: 'attack', icon: Target },
  { id: 'e5', minute: "45'", type: '半场', desc: '上半场结束 比分 1:1', tone: 'neutral', icon: Flag },
  { id: 'e6', minute: "38'", type: '角球', desc: '#4 赵磊 头球攻门被扑', sub: '本场第 3 角球', tone: 'attack', icon: CornerUpRight },
]

const OPPONENT_WEAKNESS = ['右后卫被过 11 次/5场', '定位球失分率 40%', "体能 70' 后明显下降"]

const COMMANDS = [
  { label: '换人', icon: Repeat, primary: true },
  { label: '变阵', icon: GitBranch, primary: false },
  { label: '战术暂停', icon: Flag, primary: false },
  { label: '场边指令', icon: MessageSquare, primary: false },
]

function statusDot(status: MatchStatus) {
  if (status === 'live' || status === 'preparing') return 'var(--secondary)'
  return 'var(--muted-foreground)'
}

function eventToneStyle(tone: EventTone) {
  if (tone === 'attack') {
    return {
      bg: 'color-mix(in srgb, var(--primary) 20%, var(--card))',
      border: 'var(--primary)',
      iconColor: 'var(--primary)',
      chipBg: 'color-mix(in srgb, var(--primary) 15%, transparent)',
      chipColor: 'var(--primary)',
    }
  }
  if (tone === 'defense') {
    return {
      bg: 'color-mix(in srgb, var(--secondary) 20%, var(--card))',
      border: 'var(--secondary)',
      iconColor: 'var(--secondary)',
      chipBg: 'color-mix(in srgb, var(--secondary) 15%, transparent)',
      chipColor: 'var(--secondary)',
    }
  }
  return {
    bg: 'var(--card-elevated)',
    border: 'var(--border)',
    iconColor: 'var(--muted-foreground)',
    chipBg: 'var(--card-elevated)',
    chipColor: 'var(--muted-foreground)',
  }
}

export default function Match() {
  const [matches, setMatches] = useState<MatchRow[]>(FALLBACK_MATCHES)
  const [selectedId, setSelectedId] = useState('m1')
  const [activeCommand, setActiveCommand] = useState<string | null>(null)

  useEffect(() => {
    matchApi
      .page({ current: 1, size: 20 })
      .then((res) => {
        if (res.records && res.records.length > 0) {
          setMatches(res.records.map(mapApiMatch))
          setSelectedId(res.records[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const selected = useMemo(() => matches.find((m) => m.id === selectedId) ?? matches[0], [selectedId, matches])

  return (
    <AppShell>
      {/* Top match switcher bar */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2
            className="text-xl font-bold truncate"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
          >
            {selected.opponent}
          </h2>
          <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
            {selected.round} · {selected.venue} · {selected.date} 19:30
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{
              background: 'color-mix(in srgb, var(--secondary) 15%, transparent)',
              color: 'var(--secondary)',
            }}
          >
            {selected.status === 'live' ? '比赛中' : selected.status === 'preparing' ? '备战中' : selected.status === 'finished' ? '已结束' : '未开始'}
          </span>
          <button
            className="h-9 px-4 rounded-full text-sm flex items-center gap-2 whitespace-nowrap transition-colors hover:[border-color:var(--secondary)]"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <History className="w-3.5 h-3.5" />
            <span>查看历史交锋</span>
          </button>
        </div>
      </div>

      {/* Three-column main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Match list */}
        <section
          className="lg:col-span-1 rounded-lg p-4 flex flex-col gap-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              赛事列表
            </span>
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {matches.map((m) => {
              const isSelected = m.id === selectedId
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className="p-3 rounded-md cursor-pointer text-left transition-colors"
                  style={{
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    background: isSelected
                      ? 'color-mix(in srgb, var(--primary) 5%, var(--card))'
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--secondary)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs truncate"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
                    >
                      {m.date}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: statusDot(m.status) }}
                    />
                  </div>
                  <div
                    className="text-sm font-medium mt-1 truncate"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {m.opponent}
                  </div>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                      {m.round}
                    </span>
                    {m.result ? (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md whitespace-nowrap"
                        style={{
                          background: 'var(--card-elevated)',
                          color: m.resultTone === 'success' ? 'var(--success)' : 'var(--muted-foreground)',
                        }}
                      >
                        {m.result}
                      </span>
                    ) : (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md whitespace-nowrap"
                        style={{ background: 'var(--card-elevated)', color: 'var(--muted-foreground)' }}
                      >
                        {m.venue}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Center: Live event timeline */}
        <section
          className="lg:col-span-2 rounded-lg p-5 flex flex-col"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
              <span
                className="text-sm font-semibold whitespace-nowrap"
                style={{ color: 'var(--foreground)' }}
              >
                实时事件流
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                style={{
                  background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                  color: 'var(--primary)',
                }}
              >
                {selected.status === 'live' ? '进行中' : '已归档'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-xl whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}
              >
                {selected.result?.split(' ')[0] ?? '2:1'}
              </span>
              <span
                className="text-sm whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}
              >
                63'
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-4 flex flex-col relative">
            <span
              className="absolute left-[11px] top-0 bottom-0 w-0.5"
              style={{ background: 'var(--border)' }}
            />
            {EVENTS.map((ev, idx) => {
              const tone = eventToneStyle(ev.tone)
              const Icon = ev.icon
              return (
                <div
                  key={ev.id}
                  className={`flex gap-3 relative ${idx === EVENTS.length - 1 ? '' : 'pb-4'}`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 relative z-10"
                    style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: tone.iconColor }} />
                  </div>
                  <div
                    className="flex-1 min-w-0 p-3 rounded-md"
                    style={{ background: 'var(--card-elevated)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
                      >
                        {ev.minute}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{
                          background: tone.chipBg,
                          color: tone.chipColor,
                          border: ev.tone === 'neutral' ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        {ev.type}
                      </span>
                    </div>
                    <div
                      className="text-sm mt-1 truncate"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {ev.desc}
                    </div>
                    {ev.sub && (
                      <div
                        className="text-xs mt-0.5 truncate"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {ev.sub}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Right: Opponent analysis + Command panel */}
        <section className="lg:col-span-1 flex flex-col gap-4">
          {/* Opponent analysis card */}
          <div className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" style={{ color: 'var(--secondary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                对手分析
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                {selected.opponent.replace('vs ', '')}
              </span>
              <span
                className="text-xs whitespace-nowrap"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
              >
                近5场 3胜1平1负
              </span>
            </div>
            <div className="mt-3 p-3 rounded-md" style={{ background: 'var(--card-elevated)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  推测阵型
                </span>
                <span
                  className="text-lg whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}
                >
                  4-2-3-1
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {OPPONENT_WEAKNESS.map((w) => (
                  <div key={w} className="flex items-start gap-2">
                    <ArrowRight
                      className="w-3 h-3 shrink-0 mt-0.5"
                      style={{ color: 'var(--primary)' }}
                    />
                    <span className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {w}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Command panel */}
          <div
            className="rounded-lg p-4"
            style={{
              background: 'var(--card-elevated)',
              border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
            }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                指挥操作
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {COMMANDS.map((c) => {
                const Icon = c.icon
                const isActive = activeCommand === c.label
                return (
                  <button
                    key={c.label}
                    onClick={() => setActiveCommand((prev) => (prev === c.label ? null : c.label))}
                    className="h-10 rounded-md text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition hover:brightness-110"
                    style={
                      c.primary || isActive
                        ? { background: 'var(--primary)', color: 'var(--on-accent)' }
                        : {
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                            background: isActive ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : 'transparent',
                          }
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
            <Link
              to="/app/training"
              className="mt-3 h-10 w-full rounded-full text-sm font-medium flex items-center justify-center gap-2 transition hover:brightness-110"
              style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>赛后训练计划</span>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
