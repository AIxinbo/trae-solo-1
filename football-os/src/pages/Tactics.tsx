import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  GitBranch,
  Layers,
  Monitor,
  Sparkles,
  Star,
  Users,
  ZoomIn,
} from 'lucide-react'
import AppShell from '../components/AppShell'

type FormationKey = '4-3-3' | '4-2-3-1' | '3-5-2' | '4-4-2'

interface PlayerPos {
  no: number
  left: string
  top: string
  role: 'gk' | 'def' | 'mid' | 'fwd'
  name?: string
  pos?: string
  isKey?: boolean
}

const FORMATIONS: Record<FormationKey, { label: string; players: PlayerPos[]; summary: string }> = {
  '4-3-3': {
    label: '4-3-3',
    summary: '高位压迫 · 两翼齐飞',
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 2, left: '22%', top: '20%', role: 'def', name: '王浩', pos: 'RB' },
      { no: 3, left: '22%', top: '40%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '22%', top: '60%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '22%', top: '80%', role: 'def', name: '刘洋', pos: 'LB' },
      { no: 6, left: '44%', top: '30%', role: 'mid', name: '周凯', pos: 'DM' },
      { no: 10, left: '44%', top: '50%', role: 'mid', name: '李明轩', pos: 'CAM', isKey: true },
      { no: 8, left: '44%', top: '70%', role: 'mid', name: '张伟', pos: 'CM' },
      { no: 7, left: '70%', top: '25%', role: 'fwd', name: '王浩', pos: 'RW' },
      { no: 9, left: '70%', top: '50%', role: 'fwd', name: '张志远', pos: 'ST' },
      { no: 11, left: '70%', top: '75%', role: 'fwd', name: '孙宇', pos: 'LW' },
    ],
  },
  '4-2-3-1': {
    label: '4-2-3-1',
    summary: '中场控制 · 单箭头',
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 2, left: '22%', top: '20%', role: 'def', name: '王浩', pos: 'RB' },
      { no: 3, left: '22%', top: '40%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '22%', top: '60%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '22%', top: '80%', role: 'def', name: '刘洋', pos: 'LB' },
      { no: 6, left: '40%', top: '38%', role: 'mid', name: '周凯', pos: 'DM' },
      { no: 8, left: '40%', top: '62%', role: 'mid', name: '张伟', pos: 'DM' },
      { no: 7, left: '60%', top: '25%', role: 'fwd', name: '王浩', pos: 'RW' },
      { no: 10, left: '60%', top: '50%', role: 'mid', name: '李明轩', pos: 'CAM', isKey: true },
      { no: 11, left: '60%', top: '75%', role: 'fwd', name: '孙宇', pos: 'LW' },
      { no: 9, left: '78%', top: '50%', role: 'fwd', name: '张志远', pos: 'ST' },
    ],
  },
  '3-5-2': {
    label: '3-5-2',
    summary: '边翼卫插上 · 双前锋',
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 3, left: '20%', top: '30%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '20%', top: '50%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '20%', top: '70%', role: 'def', name: '刘洋', pos: 'CB' },
      { no: 2, left: '38%', top: '15%', role: 'mid', name: '王浩', pos: 'RWB' },
      { no: 11, left: '38%', top: '85%', role: 'mid', name: '孙宇', pos: 'LWB' },
      { no: 6, left: '42%', top: '38%', role: 'mid', name: '周凯', pos: 'CM' },
      { no: 10, left: '42%', top: '50%', role: 'mid', name: '李明轩', pos: 'CAM', isKey: true },
      { no: 8, left: '42%', top: '62%', role: 'mid', name: '张伟', pos: 'CM' },
      { no: 9, left: '70%', top: '38%', role: 'fwd', name: '张志远', pos: 'ST' },
      { no: 7, left: '70%', top: '62%', role: 'fwd', name: '王浩', pos: 'ST' },
    ],
  },
  '4-4-2': {
    label: '4-4-2',
    summary: '传统平行 · 攻守均衡',
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 2, left: '22%', top: '20%', role: 'def', name: '王浩', pos: 'RB' },
      { no: 3, left: '22%', top: '40%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '22%', top: '60%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '22%', top: '80%', role: 'def', name: '刘洋', pos: 'LB' },
      { no: 7, left: '50%', top: '15%', role: 'mid', name: '王浩', pos: 'RM' },
      { no: 6, left: '50%', top: '40%', role: 'mid', name: '周凯', pos: 'CM' },
      { no: 10, left: '50%', top: '50%', role: 'mid', name: '李明轩', pos: 'CM', isKey: true },
      { no: 8, left: '50%', top: '60%', role: 'mid', name: '张伟', pos: 'CM' },
      { no: 11, left: '50%', top: '85%', role: 'mid', name: '孙宇', pos: 'LM' },
      { no: 9, left: '75%', top: '40%', role: 'fwd', name: '张志远', pos: 'ST' },
      { no: 21, left: '75%', top: '60%', role: 'fwd', name: '刘洋', pos: 'ST' },
    ],
  },
}

const AI_TIPS: Record<FormationKey, string[]> = {
  '4-3-3': [
    '右路传中成功率下降至 23%，建议切换 4-2-3-1 加强中场控制',
    '#10 号球员跑动覆盖率全场最高，建议围绕其组织进攻',
    '对方左后卫体能下降，建议本方右路加强突破',
  ],
  '4-2-3-1': [
    '单前锋 #9 易被对方双人包夹，建议边路内切支援',
    '双后腰保护到位，中路防守稳固，可适度前压',
    '#10 在前腰位置关键传球 4 次，建议继续以他为枢纽',
  ],
  '3-5-2': [
    '边翼卫插上后留出空当，建议中卫拉边补位',
    '双前锋可形成 2v2 优势，建议加强直塞球',
    '中场人数优势明显，控球率提升 6 个百分点',
  ],
  '4-4-2': [
    '两条平行防线之间空当较大，建议后腰回撤保护',
    '双前锋配合默契，可尝试斜插跑动撕开防线',
    '边路传中机会多，建议增加禁区内包抄点',
  ],
}

const TOOLS = [
  { icon: Monitor, label: '全景' },
  { icon: ZoomIn, label: '放大' },
  { icon: Layers, label: '图层' },
]

const BOTTOM_TOOLS = [
  { icon: Users, label: '球员替换' },
  { icon: GitBranch, label: '阵型切换' },
  { icon: Eye, label: '视角切换' },
  { icon: Layers, label: '数据叠加' },
]

export default function Tactics() {
  const [formation, setFormation] = useState<FormationKey>('4-3-3')
  const [tool, setTool] = useState<string>('全景')
  const [bottomTool, setBottomTool] = useState<string | null>(null)

  const formationData = FORMATIONS[formation]
  const tips = AI_TIPS[formation]

  return (
    <AppShell>
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(FORMATIONS) as FormationKey[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormation(f)}
              className="h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition hover:brightness-110"
              style={
                formation === f
                  ? { background: 'var(--primary)', color: 'var(--on-accent)', border: '1px solid var(--primary)' }
                  : { color: 'var(--foreground)', border: '1px solid var(--border)', background: 'transparent' }
              }
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.label}
              onClick={() => setTool(t.label)}
              className="h-8 px-3 rounded-md text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
              style={
                tool === t.label
                  ? { color: 'var(--on-accent)', background: 'var(--secondary)', border: '1px solid var(--secondary)' }
                  : { color: 'var(--foreground)', border: '1px solid var(--border)', background: 'transparent' }
              }
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pitch */}
        <div className="lg:col-span-2">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              background: 'var(--card-elevated)',
              border: '1px solid var(--border)',
              aspectRatio: '4/3',
              minHeight: '380px',
            }}
          >
            {/* Grass */}
            <div
              className="absolute inset-0"
              style={{ background: 'repeating-linear-gradient(90deg, #1a4d2c 0px, #1a4d2c 60px, #246b3a 60px, #246b3a 120px)' }}
            />
            {/* Field markings */}
            <div className="absolute" style={{ inset: '4%', border: '2px solid rgba(255,255,255,0.4)' }}>
              <div className="absolute" style={{ left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }} />
              <div className="absolute rounded-full" style={{ left: '50%', top: '50%', width: '18%', aspectRatio: '1/1', border: '2px solid rgba(255,255,255,0.4)', transform: 'translate(-50%, -50%)' }} />
              <div className="absolute rounded-full" style={{ left: '50%', top: '50%', width: '6px', height: '6px', background: 'rgba(255,255,255,0.65)', transform: 'translate(-50%, -50%)' }} />
              <div className="absolute" style={{ left: 0, top: '50%', width: '16%', height: '56%', border: '2px solid rgba(255,255,255,0.4)', borderLeft: 0, transform: 'translateY(-50%)' }} />
              <div className="absolute" style={{ right: 0, top: '50%', width: '16%', height: '56%', border: '2px solid rgba(255,255,255,0.4)', borderRight: 0, transform: 'translateY(-50%)' }} />
              <div className="absolute" style={{ left: 0, top: '50%', width: '7%', height: '30%', border: '2px solid rgba(255,255,255,0.4)', borderLeft: 0, transform: 'translateY(-50%)' }} />
              <div className="absolute" style={{ right: 0, top: '50%', width: '7%', height: '30%', border: '2px solid rgba(255,255,255,0.4)', borderRight: 0, transform: 'translateY(-50%)' }} />
              <div className="absolute rounded-full" style={{ left: '11%', top: '50%', width: '5px', height: '5px', background: 'rgba(255,255,255,0.65)', transform: 'translate(-50%, -50%)' }} />
              <div className="absolute rounded-full" style={{ right: '11%', top: '50%', width: '5px', height: '5px', background: 'rgba(255,255,255,0.65)', transform: 'translate(50%, -50%)' }} />
              <div className="absolute" style={{ left: '-3px', top: '50%', width: '4px', height: '18%', background: 'rgba(255,255,255,0.65)', transform: 'translateY(-50%)' }} />
              <div className="absolute" style={{ right: '-3px', top: '50%', width: '4px', height: '18%', background: 'rgba(255,255,255,0.65)', transform: 'translateY(-50%)' }} />
            </div>

            {/* Players */}
            {formationData.players.map((p) => {
              const isGk = p.role === 'gk'
              const isKey = p.isKey
              return (
                <div
                  key={p.no}
                  className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    left: p.left,
                    top: p.top,
                    transform: 'translate(-50%, -50%)',
                    background: isGk
                      ? 'color-mix(in srgb, var(--secondary) 70%, transparent)'
                      : isKey
                        ? 'var(--secondary)'
                        : 'var(--primary)',
                    color: 'var(--on-media)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: isKey
                      ? '0 0 16px color-mix(in srgb, var(--secondary) 60%, transparent), 0 2px 8px rgba(0,0,0,0.35)'
                      : '0 2px 8px rgba(0,0,0,0.35)',
                    border: isKey ? '2px solid rgba(255,255,255,0.85)' : 'none',
                  }}
                  title={`${p.no} · ${p.name ?? ''} · ${p.pos ?? ''}`}
                >
                  {p.no}
                </div>
              )
            })}

            {/* Live score badge */}
            <div
              className="absolute top-3 right-3 rounded-md px-3 py-2"
              style={{
                background: 'color-mix(in srgb, var(--background) 80%, transparent)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>VS 海港 FC</div>
              <div className="text-lg leading-tight whitespace-nowrap mono" style={{ color: 'var(--foreground)' }}>0:0</div>
              <div className="text-xs whitespace-nowrap mono" style={{ color: 'var(--secondary)' }}>63'</div>
            </div>
          </div>
        </div>

        {/* Right data panels */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Live formation */}
          <div className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 shrink-0" style={{ color: 'var(--secondary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>实时阵型</span>
            </div>
            <div className="mt-2 text-2xl font-bold mono" style={{ color: 'var(--secondary)' }}>{formationData.label}</div>
            <div className="text-xs mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>{formationData.summary}</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Stat label="控球率" value="58%" />
              <Stat label="传球成功率" value="87%" />
              <Stat label="射门" value="12 次" />
              <Stat label="角球" value="5 次" />
            </div>
          </div>

          {/* Key players */}
          <div className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>关键球员</span>
            </div>
            <div className="flex flex-col mt-3">
              {formationData.players
                .filter((p) => p.isKey || p.role === 'fwd')
                .slice(0, 3)
                .map((p, i, arr) => (
                  <div
                    key={p.no}
                    className="flex items-center gap-3 py-2"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center shrink-0 mono"
                      style={{ background: 'var(--card-elevated)', fontSize: '12px', color: 'var(--foreground)' }}
                    >
                      {p.no}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: 'var(--foreground)' }}>{p.name}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{p.pos}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs whitespace-nowrap mono" style={{ color: 'var(--secondary)' }}>
                        {p.isKey ? '8.2km' : '7.8km'}
                      </div>
                      <div className="text-sm font-semibold whitespace-nowrap mono" style={{ color: 'var(--foreground)' }}>
                        {p.isKey ? '8.5' : '7.9'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* AI tactics tips */}
          <div
            className="rounded-lg p-4"
            style={{
              background: 'var(--card-elevated)',
              border: '1px solid color-mix(in srgb, var(--secondary) 30%, transparent)',
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--secondary)' }} />
              <span className="text-sm font-semibold flex-1" style={{ color: 'var(--foreground)' }}>AI 战术提示</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: 'color-mix(in srgb, var(--secondary) 15%, transparent)', color: 'var(--secondary)' }}
              >
                实时
              </span>
            </div>
            <div className="flex flex-col gap-3 mt-3">
              {tips.map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--secondary)' }} />
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div
        className="mt-4 flex items-center justify-between flex-wrap gap-3 rounded-lg p-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex gap-2 flex-wrap">
          {BOTTOM_TOOLS.map((t) => (
            <button
              key={t.label}
              onClick={() => setBottomTool(bottomTool === t.label ? null : t.label)}
              className="h-9 px-3 sm:px-4 rounded-full flex items-center gap-2 text-sm whitespace-nowrap transition-colors"
              style={
                bottomTool === t.label
                  ? { border: '1px solid var(--secondary)', color: 'var(--secondary)', background: 'color-mix(in srgb, var(--secondary) 8%, transparent)' }
                  : { border: '1px solid var(--border)', color: 'var(--foreground)', background: 'transparent' }
              }
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <Link
          to="/app/match"
          className="h-9 px-5 rounded-full flex items-center gap-2 text-sm font-medium whitespace-nowrap transition hover:brightness-110"
          style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
        >
          <span>进入赛事指挥</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </AppShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
      <div className="text-lg whitespace-nowrap mono" style={{ color: 'var(--foreground)' }}>{value}</div>
    </div>
  )
}
