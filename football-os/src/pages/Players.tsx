import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownUp,
  ArrowLeft,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LayoutGrid,
  List,
  Plus,
  Radar as RadarIcon,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import { playerApi, type Player as ApiPlayer } from '../api'

type Position = 'GK' | 'DF' | 'MF' | 'FW'
type Health = 'healthy' | 'watch' | 'injured'

interface PlayerProfile {
  id: string
  no: string
  name: string
  posLabel: string
  pos: Position
  rating: number
  health: Health
  healthNote?: string
  age: number
  height: number
  weight: number
  contract: string
  value: string
  ratingDelta: string
  radar: { speed: number; pass: number; shot: number; dribble: number; defense: number; stamina: number }
  recent: { label: string; value: string; percent: number; tone: 'primary' | 'secondary' }[]
  evaluations: { date: string; coach: string; score: string; text: string }[]
}

const FALLBACK_PLAYERS: PlayerProfile[] = [
  {
    id: 'p10',
    no: '10',
    name: '李明轩',
    posLabel: '前腰 CAM',
    pos: 'MF',
    rating: 8.5,
    health: 'healthy',
    age: 26,
    height: 178,
    weight: 72,
    contract: '合同至 2028',
    value: '€4.5M',
    ratingDelta: '↑ 0.3 本月',
    radar: { speed: 82, pass: 88, shot: 79, dribble: 85, defense: 65, stamina: 83 },
    recent: [
      { label: '场均跑动', value: '8.2km', percent: 82, tone: 'secondary' },
      { label: '传球成功率', value: '87%', percent: 87, tone: 'primary' },
      { label: '关键传球', value: '3.4次/场', percent: 68, tone: 'secondary' },
      { label: '射门', value: '2.1次/场', percent: 42, tone: 'primary' },
      { label: '抢断', value: '1.8次/场', percent: 36, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-15', coach: '李教练', score: '8.5', text: '本场训练状态出色，核心力量提升明显，建议保持当前负荷' },
      { date: '2026-07-10', coach: '王教练', score: '8.2', text: '对阵泰达雄狮表现稳定，关键传球 4 次，跑动覆盖率全队第一' },
      { date: '2026-07-05', coach: '李教练', score: '8.0', text: '战术演练执行力强，但防守回撤速度需提升' },
      { date: '2026-06-28', coach: '医疗组', score: '7.8', text: '体能测试达标，建议加强间歇性冲刺训练' },
    ],
  },
  {
    id: 'p7',
    no: '7',
    name: '王浩',
    posLabel: '右边锋 RW',
    pos: 'FW',
    rating: 7.9,
    health: 'healthy',
    age: 24,
    height: 175,
    weight: 68,
    contract: '合同至 2027',
    value: '€3.2M',
    ratingDelta: '↑ 0.1 本月',
    radar: { speed: 88, pass: 76, shot: 80, dribble: 86, defense: 55, stamina: 78 },
    recent: [
      { label: '场均跑动', value: '9.1km', percent: 91, tone: 'secondary' },
      { label: '传球成功率', value: '78%', percent: 78, tone: 'primary' },
      { label: '关键传球', value: '2.6次/场', percent: 52, tone: 'secondary' },
      { label: '射门', value: '3.2次/场', percent: 64, tone: 'primary' },
      { label: '抢断', value: '1.2次/场', percent: 24, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-14', coach: '李教练', score: '7.9', text: '边路突破犀利，但传中选择需更稳定' },
      { date: '2026-07-09', coach: '王教练', score: '7.7', text: '完成 1 球 1 助，速度优势明显' },
    ],
  },
  {
    id: 'p9',
    no: '9',
    name: '张志远',
    posLabel: '前锋 ST',
    pos: 'FW',
    rating: 7.2,
    health: 'injured',
    healthNote: '膝伤观察',
    age: 28,
    height: 185,
    weight: 78,
    contract: '合同至 2026',
    value: '€2.8M',
    ratingDelta: '↓ 0.4 本月',
    radar: { speed: 75, pass: 70, shot: 84, dribble: 76, defense: 50, stamina: 72 },
    recent: [
      { label: '场均跑动', value: '7.4km', percent: 74, tone: 'secondary' },
      { label: '传球成功率', value: '72%', percent: 72, tone: 'primary' },
      { label: '关键传球', value: '1.8次/场', percent: 36, tone: 'secondary' },
      { label: '射门', value: '3.8次/场', percent: 76, tone: 'primary' },
      { label: '抢断', value: '0.8次/场', percent: 16, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-12', coach: '医疗组', score: '7.2', text: '膝部不适，建议短期休整并复查' },
      { date: '2026-07-03', coach: '李教练', score: '7.6', text: '门前嗅觉佳，但回撤接应偏少' },
    ],
  },
  {
    id: 'p4',
    no: '4',
    name: '赵磊',
    posLabel: '中后卫 CB',
    pos: 'DF',
    rating: 8.1,
    health: 'healthy',
    age: 27,
    height: 188,
    weight: 82,
    contract: '合同至 2028',
    value: '€3.8M',
    ratingDelta: '↑ 0.2 本月',
    radar: { speed: 70, pass: 74, shot: 60, dribble: 65, defense: 90, stamina: 85 },
    recent: [
      { label: '场均跑动', value: '7.8km', percent: 78, tone: 'secondary' },
      { label: '传球成功率', value: '84%', percent: 84, tone: 'primary' },
      { label: '关键传球', value: '0.6次/场', percent: 12, tone: 'secondary' },
      { label: '射门', value: '0.4次/场', percent: 8, tone: 'primary' },
      { label: '抢断', value: '4.2次/场', percent: 84, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-13', coach: '李教练', score: '8.1', text: '防空与拦截俱佳，防线指挥能力提升' },
    ],
  },
  {
    id: 'p1',
    no: '1',
    name: '刘强',
    posLabel: '门将 GK',
    pos: 'GK',
    rating: 7.8,
    health: 'healthy',
    age: 29,
    height: 190,
    weight: 80,
    contract: '合同至 2027',
    value: '€2.5M',
    ratingDelta: '↑ 0.1 本月',
    radar: { speed: 60, pass: 70, shot: 30, dribble: 50, defense: 88, stamina: 80 },
    recent: [
      { label: '扑救率', value: '76%', percent: 76, tone: 'secondary' },
      { label: '传球成功率', value: '82%', percent: 82, tone: 'primary' },
      { label: '出击', value: '1.2次/场', percent: 48, tone: 'secondary' },
      { label: '高球拦截', value: '2.4次/场', percent: 72, tone: 'primary' },
      { label: '零封场次', value: '8/19', percent: 42, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-11', coach: '李教练', score: '7.8', text: '反应迅速，门线技术稳定，出击时机可更果断' },
    ],
  },
  {
    id: 'p19',
    no: '19',
    name: '张伟',
    posLabel: '中前卫 CM',
    pos: 'MF',
    rating: 7.5,
    health: 'healthy',
    age: 23,
    height: 180,
    weight: 74,
    contract: '合同至 2028',
    value: '€2.0M',
    ratingDelta: '→ 持平',
    radar: { speed: 78, pass: 82, shot: 70, dribble: 78, defense: 72, stamina: 86 },
    recent: [
      { label: '场均跑动', value: '8.6km', percent: 86, tone: 'secondary' },
      { label: '传球成功率', value: '85%', percent: 85, tone: 'primary' },
      { label: '关键传球', value: '2.2次/场', percent: 44, tone: 'secondary' },
      { label: '射门', value: '1.4次/场', percent: 28, tone: 'primary' },
      { label: '抢断', value: '2.6次/场', percent: 52, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-12', coach: '王教练', score: '7.5', text: '中场覆盖广，传控稳定，向前压迫可更激进' },
    ],
  },
  {
    id: 'p21',
    no: '21',
    name: '刘洋',
    posLabel: '左后卫 LB',
    pos: 'DF',
    rating: 7.6,
    health: 'healthy',
    age: 25,
    height: 176,
    weight: 70,
    contract: '合同至 2027',
    value: '€2.2M',
    ratingDelta: '↑ 0.2 本月',
    radar: { speed: 84, pass: 76, shot: 60, dribble: 78, defense: 80, stamina: 84 },
    recent: [
      { label: '场均跑动', value: '8.8km', percent: 88, tone: 'secondary' },
      { label: '传球成功率', value: '80%', percent: 80, tone: 'primary' },
      { label: '关键传球', value: '1.8次/场', percent: 36, tone: 'secondary' },
      { label: '射门', value: '0.6次/场', percent: 12, tone: 'primary' },
      { label: '抢断', value: '3.4次/场', percent: 68, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-13', coach: '李教练', score: '7.6', text: '攻防转换积极，回防到位率提升' },
    ],
  },
  {
    id: 'p5',
    no: '5',
    name: '陈刚',
    posLabel: '中后卫 CB',
    pos: 'DF',
    rating: 7.7,
    health: 'healthy',
    age: 26,
    height: 186,
    weight: 80,
    contract: '合同至 2028',
    value: '€3.0M',
    ratingDelta: '↑ 0.1 本月',
    radar: { speed: 72, pass: 72, shot: 58, dribble: 62, defense: 88, stamina: 82 },
    recent: [
      { label: '场均跑动', value: '7.6km', percent: 76, tone: 'secondary' },
      { label: '传球成功率', value: '82%', percent: 82, tone: 'primary' },
      { label: '关键传球', value: '0.4次/场', percent: 8, tone: 'secondary' },
      { label: '射门', value: '0.3次/场', percent: 6, tone: 'primary' },
      { label: '抢断', value: '3.8次/场', percent: 76, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-13', coach: '李教练', score: '7.7', text: '与赵磊搭档稳定，防空能力突出' },
    ],
  },
  {
    id: 'p8',
    no: '8',
    name: '周凯',
    posLabel: '后腰 DM',
    pos: 'MF',
    rating: 7.4,
    health: 'watch',
    healthNote: '负荷偏高',
    age: 27,
    height: 182,
    weight: 76,
    contract: '合同至 2026',
    value: '€2.6M',
    ratingDelta: '↓ 0.2 本月',
    radar: { speed: 76, pass: 80, shot: 65, dribble: 72, defense: 84, stamina: 78 },
    recent: [
      { label: '场均跑动', value: '9.2km', percent: 92, tone: 'secondary' },
      { label: '传球成功率', value: '83%', percent: 83, tone: 'primary' },
      { label: '关键传球', value: '1.4次/场', percent: 28, tone: 'secondary' },
      { label: '射门', value: '0.8次/场', percent: 16, tone: 'primary' },
      { label: '抢断', value: '4.6次/场', percent: 92, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-14', coach: '医疗组', score: '7.4', text: '近 3 场跑动均超 10km，建议轮换以避免疲劳累积' },
    ],
  },
  {
    id: 'p11',
    no: '11',
    name: '孙宇',
    posLabel: '左边锋 LW',
    pos: 'FW',
    rating: 7.9,
    health: 'healthy',
    age: 22,
    height: 173,
    weight: 68,
    contract: '合同至 2029',
    value: '€3.5M',
    ratingDelta: '↑ 0.4 本月',
    radar: { speed: 90, pass: 78, shot: 76, dribble: 88, defense: 52, stamina: 80 },
    recent: [
      { label: '场均跑动', value: '8.4km', percent: 84, tone: 'secondary' },
      { label: '传球成功率', value: '76%', percent: 76, tone: 'primary' },
      { label: '关键传球', value: '2.8次/场', percent: 56, tone: 'secondary' },
      { label: '射门', value: '2.6次/场', percent: 52, tone: 'primary' },
      { label: '抢断', value: '1.0次/场', percent: 20, tone: 'secondary' },
    ],
    evaluations: [
      { date: '2026-07-14', coach: '李教练', score: '7.9', text: '内切射门威胁大，本月进步明显' },
    ],
  },
]

const FILTERS: { label: string; value: 'ALL' | Position }[] = [
  { label: '全部', value: 'ALL' },
  { label: '门将 GK', value: 'GK' },
  { label: '后卫 DF', value: 'DF' },
  { label: '中场 MF', value: 'MF' },
  { label: '前锋 FW', value: 'FW' },
]

function mapApiPlayer(p: ApiPlayer): PlayerProfile {
  const posMap: Record<string, Position> = { GK: 'GK', DF: 'DF', MF: 'MF', FW: 'FW' }
  const pos = posMap[p.pos] || 'MF'
  const healthMap: Record<string, Health> = { healthy: 'healthy', watch: 'watch', injured: 'injured' }
  const health = healthMap[p.health] || 'healthy'
  const speed = p.ratingSpeed ?? 70
  const pass = p.ratingPass ?? 70
  const shot = p.ratingAttack ?? 70
  const defense = p.ratingDefense ?? 70
  const stamina = p.ratingPhysical ?? 70
  const dribble = Math.round((shot + pass) / 2)
  return {
    id: p.id,
    no: p.no,
    name: p.name,
    posLabel: p.posLabel,
    pos,
    rating: p.rating,
    health,
    healthNote: p.healthNote ?? undefined,
    age: p.age ?? 0,
    height: p.height ?? 0,
    weight: p.weight ?? 0,
    contract: p.contract ?? '',
    value: p.value ?? '',
    ratingDelta: p.ratingDelta ?? '',
    radar: { speed, pass, shot, dribble, defense, stamina },
    recent: [],
    evaluations: [],
  }
}

function healthColor(h: Health) {
  if (h === 'healthy') return 'var(--success)'
  if (h === 'watch') return 'color-mix(in srgb, var(--primary) 60%, var(--success))'
  return 'var(--destructive)'
}

function healthLabel(h: Health) {
  if (h === 'healthy') return '健康'
  if (h === 'watch') return '观察'
  return '伤病'
}

// Radar polygon points: 6 axes starting at top, clockwise
// Each axis i (0..5) has angle = -90 + i*60 degrees
// For value v (0..100), point is at (50% + 50%*v/100*cos, 50% + 50%*v/100*sin)
function radarPoints(r: Player['radar']) {
  const order: (keyof Player['radar'])[] = ['speed', 'pass', 'shot', 'dribble', 'defense', 'stamina']
  return order
    .map((key, i) => {
      const angle = (-90 + i * 60) * (Math.PI / 180)
      const v = r[key] / 100
      const x = 50 + 50 * v * Math.cos(angle)
      const y = 50 + 50 * v * Math.sin(angle)
      return `${x.toFixed(2)}% ${y.toFixed(2)}%`
    })
    .join(', ')
}

function radarLabelStyle(i: number) {
  // 0 top, 1 upper-right, 2 lower-right, 3 bottom, 4 lower-left, 5 upper-left
  const base: React.CSSProperties = { position: 'absolute', fontSize: '11px', color: 'var(--muted-foreground)' }
  switch (i) {
    case 0:
      return { ...base, left: '50%', top: '-8px', transform: 'translateX(-50%)' }
    case 1:
      return { ...base, right: '-32px', top: '22%' }
    case 2:
      return { ...base, right: '-32px', bottom: '22%' }
    case 3:
      return { ...base, left: '50%', bottom: '-8px', transform: 'translateX(-50%)' }
    case 4:
      return { ...base, left: '-32px', bottom: '22%' }
    default:
      return { ...base, left: '-32px', top: '22%' }
  }
}

const RADAR_LABELS = [
  { key: 'speed' as const, label: '速度' },
  { key: 'pass' as const, label: '传球' },
  { key: 'shot' as const, label: '射门' },
  { key: 'dribble' as const, label: '盘带' },
  { key: 'defense' as const, label: '防守' },
  { key: 'stamina' as const, label: '体能' },
]

export default function Players() {
  const [players, setPlayers] = useState<PlayerProfile[]>(FALLBACK_PLAYERS)
  const [filter, setFilter] = useState<'ALL' | Position>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortDesc, setSortDesc] = useState(true)
  const [selectedId, setSelectedId] = useState('p10')

  useEffect(() => {
    playerApi
      .all()
      .then((list) => {
        if (list && list.length > 0) {
          setPlayers(list.map(mapApiPlayer))
          setSelectedId(list[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const visiblePlayers = useMemo(() => {
    let list = filter === 'ALL' ? players : players.filter((p) => p.pos === filter)
    list = [...list].sort((a, b) => (sortDesc ? b.rating - a.rating : a.rating - b.rating))
    return list
  }, [players, filter, sortDesc])

  const selected = useMemo(() => {
    const found = players.find((p) => p.id === selectedId)
    if (found) return found
    return visiblePlayers[0] ?? players[0]
  }, [selectedId, visiblePlayers, players])

  return (
    <AppShell>
      {/* Filter bar */}
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const isActive = filter === f.value
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="h-8 px-3 rounded-full text-xs transition"
                style={
                  isActive
                    ? {
                        background: 'var(--primary)',
                        color: 'var(--on-accent)',
                        border: '1px solid var(--primary)',
                      }
                    : {
                        border: '1px solid var(--border)',
                        color: 'var(--muted-foreground)',
                        background: 'transparent',
                      }
                }
              >
                {f.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className="h-8 px-3 rounded-md text-xs flex items-center gap-1.5 transition hover:[border-color:var(--secondary)]"
              style={{
                border: '1px solid var(--border)',
                color: viewMode === 'list' ? 'var(--foreground)' : 'var(--muted-foreground)',
                background: viewMode === 'list' ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'transparent',
              }}
            >
              <List className="w-3.5 h-3.5" />
              <span>列表</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="h-8 px-3 rounded-md text-xs flex items-center gap-1.5 transition hover:[border-color:var(--secondary)]"
              style={{
                border: '1px solid var(--border)',
                color: viewMode === 'grid' ? 'var(--foreground)' : 'var(--muted-foreground)',
                background: viewMode === 'grid' ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'transparent',
              }}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>卡片</span>
            </button>
          </div>
          <button
            onClick={() => setSortDesc((v) => !v)}
            className="h-8 px-3 rounded-md text-xs flex items-center gap-1.5 transition hover:[border-color:var(--secondary)]"
            style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>{sortDesc ? '按评分降序' : '按评分升序'}</span>
          </button>
        </div>
      </div>

      {/* Two-column master-detail */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: roster list */}
        <div
          className="lg:col-span-1 rounded-lg p-4 flex flex-col gap-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              球员名单
            </span>
            <span
              className="text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
            >
              {visiblePlayers.length} 人
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {visiblePlayers.map((p) => {
              const isSelected = p.id === selected.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className="p-3 rounded-md flex items-center gap-3 cursor-pointer text-left transition-colors"
                  style={{
                    background: isSelected
                      ? 'color-mix(in srgb, var(--primary) 5%, var(--card))'
                      : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--secondary)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center shrink-0"
                    style={{
                      background: 'var(--card-elevated)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                    }}
                  >
                    {p.no}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {p.name}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {p.posLabel}
                      {p.healthNote ? ` · ${p.healthNote}` : ''}
                    </div>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: healthColor(p.health) }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}
                  >
                    {p.rating.toFixed(1)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: player detail */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Player header card */}
          <div
            className="rounded-lg p-6 flex items-center gap-5 flex-wrap"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'var(--primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--on-accent)',
              }}
            >
              {selected.no}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-2xl font-bold truncate"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
              >
                {selected.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                #{selected.no} · {selected.posLabel} · {selected.age}岁 · {selected.height}cm / {selected.weight}kg
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--foreground)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: healthColor(selected.health) }}
                  />
                  {healthLabel(selected.health)}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {selected.contract}
                </span>
                <span
                  className="text-xs"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}
                >
                  {selected.value}
                </span>
              </div>
            </div>
            <div className="text-center shrink-0">
              <div
                className="text-4xl font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}
              >
                {selected.rating.toFixed(1)}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                综合评分
              </div>
              <div
                className="text-xs mt-0.5"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: selected.ratingDelta.startsWith('↑') ? 'var(--success)' : selected.ratingDelta.startsWith('↓') ? 'var(--destructive)' : 'var(--muted-foreground)',
                }}
              >
                {selected.ratingDelta}
              </div>
            </div>
          </div>

          {/* Radar + recent data */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ability radar card */}
            <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <RadarIcon className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  能力雷达
                </span>
              </div>
              {/* Radar chart */}
              <div className="mt-4 relative mx-auto" style={{ width: 220, height: 220 }}>
                {/* Hex grid layers */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                    border: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
                    background: 'color-mix(in srgb, var(--border) 10%, transparent)',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    inset: '18%',
                    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                    border: '1px solid color-mix(in srgb, var(--border) 50%, transparent)',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    inset: '36%',
                    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                    border: '1px solid color-mix(in srgb, var(--border) 40%, transparent)',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    inset: '54%',
                    clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
                    border: '1px solid color-mix(in srgb, var(--border) 30%, transparent)',
                  }}
                />
                {/* Axes */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div
                    key={deg}
                    className="absolute left-1/2 top-1/2 w-px"
                    style={{
                      height: '50%',
                      transform: `translate(-50%, 0) rotate(${deg}deg)`,
                      transformOrigin: 'top center',
                      background: 'var(--border)',
                    }}
                  />
                ))}
                {/* Data polygon */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: `polygon(${radarPoints(selected.radar)})`,
                    background: 'color-mix(in srgb, var(--secondary) 22%, transparent)',
                    border: '1.5px solid var(--secondary)',
                  }}
                />
                {/* Labels */}
                {RADAR_LABELS.map((l, i) => (
                  <span key={l.key} style={radarLabelStyle(i)}>
                    {l.label}{' '}
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}>
                      {selected.radar[l.key]}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recent data bars */}
            <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  近 5 场数据
                </span>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                {selected.recent.map((r) => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted-foreground)' }}>{r.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}>
                        {r.value}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full mt-1.5 overflow-hidden"
                      style={{ background: 'var(--card-elevated)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.percent}%`,
                          background: r.tone === 'primary' ? 'var(--primary)' : 'var(--secondary)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evaluation timeline */}
          <div className="rounded-lg p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  评估记录
                </span>
              </div>
              <button
                className="h-8 px-3 rounded-full text-xs flex items-center gap-1.5 transition hover:[border-color:var(--secondary)]"
                style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增评估</span>
              </button>
            </div>
            <div className="mt-4 flex flex-col relative">
              <div
                className="absolute left-2 top-0 bottom-0 w-0.5"
                style={{ background: 'var(--border)' }}
              />
              {selected.evaluations.map((ev, idx) => (
                <div
                  key={ev.date + idx}
                  className={`flex gap-3 relative ${idx === selected.evaluations.length - 1 ? '' : 'pb-4'}`}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 relative z-10 mt-1"
                    style={{ border: '2px solid var(--secondary)', background: 'var(--card)' }}
                  />
                  <div
                    className="flex-1 p-3 rounded-md"
                    style={{ background: 'var(--card-elevated)' }}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-xs"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}
                      >
                        {ev.date}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {ev.coach}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                          color: 'var(--primary)',
                        }}
                      >
                        {ev.score}
                      </span>
                    </div>
                    <p className="text-sm mt-1.5" style={{ color: 'var(--foreground)' }}>
                      {ev.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back to dashboard CTA */}
          <div
            className="rounded-lg p-5 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <LayoutDashboard className="w-6 h-6 shrink-0" style={{ color: 'var(--secondary)' }} />
              <div className="min-w-0">
                <div
                  className="text-base font-semibold truncate"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                >
                  返回教练工作台
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                  查看今日概览、训练与赛事安排
                </div>
              </div>
            </div>
            <Link
              to="/app/dashboard"
              className="h-10 px-5 rounded-full flex items-center gap-2 text-sm font-medium whitespace-nowrap transition hover:brightness-110"
              style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回工作台</span>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
