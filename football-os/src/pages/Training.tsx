import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Plus,
  Users,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import { trainingApi, type TrainingItem as ApiTraining } from '../api'

type PlanStatus = 'live' | 'done' | 'todo'
type ItemStatus = 'done' | 'live' | 'todo'
type Intensity = 'low' | 'mid' | 'high'

interface PlanItem {
  id: string
  name: string
  time: string
  duration: string
  coach: string
  group: string
  intensity: Intensity
  status: ItemStatus
}

interface Plan {
  id: string
  date: string
  name: string
  status: PlanStatus
  itemsCount: number
  playersCount: number
  schedule: string
  venue: string
  coachTeam: string
  progress: number
  joined: number
  total: number
  doneItems: number
  totalItems: number
  elapsed: string
  items: PlanItem[]
}

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'p1',
    date: '2026-07-15',
    name: '体能强化训练',
    status: 'live',
    itemsCount: 5,
    playersCount: 22,
    schedule: '2026-07-15 14:00-16:30',
    venue: '主训练场',
    coachTeam: '教练组全员',
    progress: 68,
    joined: 22,
    total: 28,
    doneItems: 3,
    totalItems: 5,
    elapsed: '1h 42m',
    items: [
      { id: 'i1', name: '热身+柔韧性', time: '14:00-14:20', duration: '20min', coach: '张教练', group: '全员', intensity: 'mid', status: 'done' },
      { id: 'i2', name: '速度与爆发力', time: '14:20-15:00', duration: '40min', coach: '王教练', group: '前锋组+边卫组', intensity: 'high', status: 'done' },
      { id: 'i3', name: '核心力量', time: '15:00-15:30', duration: '30min', coach: '李教练', group: '全员', intensity: 'mid', status: 'done' },
      { id: 'i4', name: '有氧耐力', time: '15:30-16:10', duration: '40min', coach: '张教练', group: '中场组+后卫组', intensity: 'high', status: 'live' },
      { id: 'i5', name: '放松恢复', time: '16:10-16:30', duration: '20min', coach: '医疗组', group: '全员', intensity: 'low', status: 'todo' },
    ],
  },
  {
    id: 'p2',
    date: '2026-07-14',
    name: '战术演练',
    status: 'done',
    itemsCount: 4,
    playersCount: 25,
    schedule: '2026-07-14 10:00-12:00',
    venue: '主训练场',
    coachTeam: '李教练',
    progress: 100,
    joined: 25,
    total: 28,
    doneItems: 4,
    totalItems: 4,
    elapsed: '2h 05m',
    items: [
      { id: 'i1', name: '阵型演练', time: '10:00-10:45', duration: '45min', coach: '李教练', group: '全员', intensity: 'mid', status: 'done' },
      { id: 'i2', name: '定位球战术', time: '10:45-11:20', duration: '35min', coach: '王教练', group: '进攻组', intensity: 'mid', status: 'done' },
      { id: 'i3', name: '攻防转换', time: '11:20-11:50', duration: '30min', coach: '李教练', group: '全员', intensity: 'high', status: 'done' },
      { id: 'i4', name: '战术复盘', time: '11:50-12:00', duration: '10min', coach: '教练组', group: '全员', intensity: 'low', status: 'done' },
    ],
  },
  {
    id: 'p3',
    date: '2026-07-13',
    name: '技术专项',
    status: 'done',
    itemsCount: 6,
    playersCount: 18,
    schedule: '2026-07-13 09:00-11:30',
    venue: '技术训练场',
    coachTeam: '张教练',
    progress: 100,
    joined: 18,
    total: 28,
    doneItems: 6,
    totalItems: 6,
    elapsed: '2h 28m',
    items: [
      { id: 'i1', name: '传接球精度', time: '09:00-09:30', duration: '30min', coach: '张教练', group: '中场组', intensity: 'mid', status: 'done' },
      { id: 'i2', name: '射门技术', time: '09:30-10:15', duration: '45min', coach: '王教练', group: '前锋组', intensity: 'high', status: 'done' },
    ],
  },
  {
    id: 'p4',
    date: '2026-07-16',
    name: '赛前适应',
    status: 'todo',
    itemsCount: 3,
    playersCount: 28,
    schedule: '2026-07-16 10:00-11:30',
    venue: '主体育场',
    coachTeam: '李教练',
    progress: 0,
    joined: 0,
    total: 28,
    doneItems: 0,
    totalItems: 3,
    elapsed: '0m',
    items: [
      { id: 'i1', name: '场地适应', time: '10:00-10:30', duration: '30min', coach: '李教练', group: '全员', intensity: 'low', status: 'todo' },
      { id: 'i2', name: '战术演练', time: '10:30-11:10', duration: '40min', coach: '教练组', group: '全员', intensity: 'mid', status: 'todo' },
      { id: 'i3', name: '点球练习', time: '11:10-11:30', duration: '20min', coach: '王教练', group: '主罚组', intensity: 'mid', status: 'todo' },
    ],
  },
  {
    id: 'p5',
    date: '2026-07-17',
    name: '定位球训练',
    status: 'todo',
    itemsCount: 4,
    playersCount: 20,
    schedule: '2026-07-17 15:00-16:30',
    venue: '主训练场',
    coachTeam: '王教练',
    progress: 0,
    joined: 0,
    total: 28,
    doneItems: 0,
    totalItems: 4,
    elapsed: '0m',
    items: [
      { id: 'i1', name: '角球进攻', time: '15:00-15:30', duration: '30min', coach: '王教练', group: '进攻组', intensity: 'mid', status: 'todo' },
      { id: 'i2', name: '角球防守', time: '15:30-16:00', duration: '30min', coach: '李教练', group: '防守组', intensity: 'mid', status: 'todo' },
    ],
  },
]

const PLAYERS_EXEC = [
  { no: '10', name: '李明轩', percent: 100, status: 'done' },
  { no: '7', name: '王浩', percent: 95, status: 'done' },
  { no: '4', name: '赵磊', percent: 88, status: 'done' },
  { no: '19', name: '张伟', percent: 72, status: 'live' },
  { no: '21', name: '刘洋', percent: 100, status: 'done' },
  { no: '5', name: '陈刚', percent: 100, status: 'done' },
  { no: '8', name: '周凯', percent: 91, status: 'done' },
  { no: '11', name: '孙宇', percent: 100, status: 'done' },
]

interface DayPlan {
  name: string
  time: string
  tone: 'primary' | 'secondary' | 'success' | 'muted'
}

interface CalendarDay {
  weekday: string
  date: string
  isToday?: boolean
  plans: DayPlan[]
}

const WEEK: CalendarDay[] = [
  { weekday: '周一', date: '13', plans: [
    { name: '体能训练', time: '09:00', tone: 'primary' },
    { name: '战术训练', time: '15:00', tone: 'secondary' },
  ]},
  { weekday: '周二', date: '14', plans: [
    { name: '技术训练', time: '09:00', tone: 'success' },
    { name: '体能训练', time: '16:00', tone: 'primary' },
  ]},
  { weekday: '周三', date: '15', isToday: true, plans: [
    { name: '体能强化', time: '14:00', tone: 'primary' },
    { name: '战术演练', time: '16:00', tone: 'secondary' },
  ]},
  { weekday: '周四', date: '16', plans: [
    { name: '战术训练', time: '10:00', tone: 'secondary' },
    { name: '恢复训练', time: '17:00', tone: 'muted' },
  ]},
  { weekday: '周五', date: '17', plans: [
    { name: '赛前适应', time: '10:00', tone: 'primary' },
    { name: '定位球', time: '15:00', tone: 'secondary' },
  ]},
  { weekday: '周六', date: '18', plans: [
    { name: '恢复训练', time: '10:00', tone: 'muted' },
  ]},
  { weekday: '周日', date: '19', plans: [
    { name: 'VS 海港 FC', time: '19:30', tone: 'primary' },
  ]},
]

function statusBadge(status: PlanStatus) {
  if (status === 'live') {
    return { bg: 'color-mix(in srgb, var(--secondary) 15%, transparent)', color: 'var(--secondary)', label: '进行中' }
  }
  if (status === 'done') {
    return { bg: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)', label: '已完成' }
  }
  return { bg: 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)', color: 'var(--muted-foreground)', label: '待开始' }
}

function itemStatusBadge(status: ItemStatus) {
  if (status === 'done') {
    return { bg: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)', label: '已完成', border: 'var(--success)' }
  }
  if (status === 'live') {
    return { bg: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)', label: '进行中', border: 'var(--primary)' }
  }
  return { bg: 'color-mix(in srgb, var(--muted-foreground) 15%, transparent)', color: 'var(--muted-foreground)', label: '待开始', border: 'var(--muted-foreground)' }
}

function intensityStyle(intensity: Intensity) {
  if (intensity === 'high') return { color: 'var(--primary)' }
  if (intensity === 'mid') return { color: 'var(--secondary)' }
  return { color: 'var(--muted-foreground)' }
}

function intensityLabel(intensity: Intensity) {
  if (intensity === 'high') return '高强度'
  if (intensity === 'mid') return '中强度'
  return '低强度'
}

function toneColor(tone: DayPlan['tone']) {
  if (tone === 'primary') return 'var(--primary)'
  if (tone === 'secondary') return 'var(--secondary)'
  if (tone === 'success') return 'var(--success)'
  return 'var(--muted-foreground)'
}

function mapApiTraining(t: ApiTraining): Plan {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(t.trainDate)
  d.setHours(0, 0, 0, 0)
  let status: PlanStatus = 'todo'
  if (d.getTime() < today.getTime()) status = 'done'
  else if (d.getTime() === today.getTime()) status = 'live'
  const intensity: Intensity = t.intensity === 'high' ? 'high' : t.intensity === 'low' ? 'low' : 'mid'
  return {
    id: t.id,
    date: t.trainDate,
    name: t.title,
    status,
    itemsCount: 0,
    playersCount: 0,
    schedule: `${t.trainDate} ${t.startTime || ''}-${t.endTime || ''}`,
    venue: t.location || '训练场',
    coachTeam: '教练组',
    progress: status === 'done' ? 100 : status === 'live' ? 50 : 0,
    joined: status === 'todo' ? 0 : 22,
    total: 28,
    doneItems: 0,
    totalItems: 0,
    elapsed: '0m',
    items: t.content
      ? [{ id: 'c1', name: t.content, time: `${t.startTime || ''}-${t.endTime || ''}`, duration: '', coach: '', group: '全员', intensity, status: status === 'done' ? 'done' : status === 'live' ? 'live' : 'todo' }]
      : [],
  }
}

export default function Training() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [selectedId, setSelectedId] = useState('p1')
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    trainingApi
      .page({ current: 1, size: 20 })
      .then((res) => {
        if (res.records && res.records.length > 0) {
          setPlans(res.records.map(mapApiTraining))
          setSelectedId(res.records[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const selected = useMemo(() => plans.find((p) => p.id === selectedId) ?? plans[0], [selectedId, plans])

  const weekLabel = useMemo(() => {
    const baseStart = new Date(2026, 6, 13)
    const start = new Date(baseStart)
    start.setDate(start.getDate() + weekOffset * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return `${fmt(start)} 至 ${fmt(end)}`
  }, [weekOffset])

  return (
    <AppShell>
      {/* 1. Week training calendar bar */}
      <div className="mb-4 rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-4 h-4 shrink-0" style={{ color: 'var(--secondary)' }} />
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
              本周训练日历
            </span>
            <span
              className="text-xs whitespace-nowrap"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
            >
              {weekLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <button
                onClick={() => setWeekOffset((v) => v - 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:[border-color:var(--secondary)]"
                style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                aria-label="上一周"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setWeekOffset((v) => v + 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:[border-color:var(--secondary)]"
                style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
                aria-label="下一周"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              className="h-8 px-3 rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap transition hover:brightness-110"
              style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建计划</span>
            </button>
          </div>
        </div>

        {/* Calendar strip: 7 days */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
          {WEEK.map((day) => (
            <div key={day.weekday + day.date} className="min-w-0">
              <div className="text-center">
                <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {day.weekday}
                </div>
                {day.isToday ? (
                  <div
                    className="w-7 h-7 mx-auto mt-0.5 rounded-full flex items-center justify-center"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--on-accent)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                    }}
                  >
                    {day.date}
                  </div>
                ) : (
                  <div
                    className="text-sm mt-0.5"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}
                  >
                    {day.date}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-2">
                {day.plans.map((p, idx) => {
                  const color = toneColor(p.tone)
                  return (
                    <div
                      key={idx}
                      className="min-h-[48px] rounded-md p-2"
                      style={{
                        background: `color-mix(in srgb, ${color} 15%, var(--card))`,
                        borderLeft: `2px solid ${color}`,
                      }}
                    >
                      <div className="text-xs truncate" style={{ color: 'var(--foreground)' }}>
                        {p.name}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
                      >
                        {p.time}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Two-column main area */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column: Plan list */}
        <div className="lg:col-span-1">
          <div
            className="rounded-lg p-4 flex flex-col gap-2"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                训练计划
              </span>
              <button
                className="flex items-center gap-1 text-xs transition-colors hover:[color:var(--foreground)]"
                style={{ color: 'var(--muted-foreground)' }}
                aria-label="筛选"
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              {plans.map((p) => {
                const isSelected = p.id === selectedId
                const badge = statusBadge(p.status)
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
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
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
                      >
                        {p.date}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div
                      className="text-sm font-medium mt-1.5 truncate"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="flex items-center gap-3 mt-1.5 text-xs"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <span className="whitespace-nowrap">{p.itemsCount} 项</span>
                      <span className="whitespace-nowrap">{p.playersCount} 人</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Middle-right column: Plan detail */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Plan header card with progress ring */}
          <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2
                  className="text-lg font-bold truncate"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  {selected.name}
                </h2>
                <p className="text-sm mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
                  {selected.schedule} · {selected.venue} · {selected.coachTeam}
                </p>
              </div>
              {/* Progress ring */}
              <div
                className="relative w-20 h-20 shrink-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--success) 0% ${selected.progress}%, var(--card-elevated) ${selected.progress}% 100%)`,
                }}
              >
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--card)' }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}
                  >
                    {selected.progress}%
                  </span>
                </div>
              </div>
            </div>
            {/* Status bar */}
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                <span
                  className="text-sm whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}
                >
                  {selected.joined}/{selected.total}
                </span>
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                  参与球员
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--success)' }} />
                <span
                  className="text-sm whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}
                >
                  {selected.doneItems}/{selected.totalItems}
                </span>
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                  已完成训练项
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                <span
                  className="text-sm whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}
                >
                  {selected.elapsed}
                </span>
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                  用时
                </span>
              </div>
            </div>
          </div>

          {/* Training items list card */}
          <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              训练项明细
            </span>
            <div className="flex flex-col gap-3 mt-4">
              {selected.items.map((item) => {
                const badge = itemStatusBadge(item.status)
                const intStyle = intensityStyle(item.intensity)
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-md"
                    style={{ background: 'var(--card-elevated)', borderLeft: `3px solid ${badge.border}` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {item.name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div
                      className="text-xs mt-1.5 truncate"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
                    >
                      {item.time} · {item.duration} · {item.coach}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <span className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {item.group}
                      </span>
                      <span
                        className="text-xs whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-mono)', color: intStyle.color }}
                      >
                        {intensityLabel(item.intensity)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Player execution card */}
          <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                参与球员执行情况
              </span>
              <button
                className="text-xs whitespace-nowrap transition hover:brightness-110"
                style={{ color: 'var(--secondary)' }}
              >
                查看全部
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
              {PLAYERS_EXEC.map((p) => (
                <div
                  key={p.no}
                  className="p-3 rounded-md flex items-center gap-3"
                  style={{ background: 'var(--card-elevated)' }}
                >
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: 'var(--card)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--foreground)',
                    }}
                  >
                    {p.no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate" style={{ color: 'var(--foreground)' }}>
                      {p.name}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
                    >
                      {p.percent}%
                    </div>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: p.status === 'live' ? 'var(--primary)' : 'var(--success)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CTA banner */}
      <div
        className="mt-4 rounded-lg p-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Users className="w-6 h-6 shrink-0" style={{ color: 'var(--primary)' }} />
          <div className="min-w-0">
            <div
              className="text-base font-semibold truncate"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
            >
              查看球员档案与评估
            </div>
            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>
              个体训练数据、能力曲线、评估记录
            </div>
          </div>
        </div>
        <Link
          to="/app/players"
          className="h-10 px-5 rounded-full flex items-center gap-2 text-sm font-medium whitespace-nowrap transition hover:brightness-110"
          style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
        >
          <span>进入球员档案</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </AppShell>
  )
}
