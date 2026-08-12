import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronDown,
  Edit3,
  Eye,
  GitBranch,
  Layers,
  Monitor,
  Plus,
  Sparkles,
  Star,
  Users,
  X,
  ZoomIn,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import { formationApi, tacticsApi } from '../api'
import type { Formation, TacticsLibrary } from '../api/types'

// ============================================================
// 类型定义
// ============================================================
interface PlayerPos {
  no: number
  left: string
  top: string
  role: 'gk' | 'def' | 'mid' | 'fwd'
  name?: string
  pos?: string
  isKey?: boolean
  rating?: number
}

interface FormationDef {
  id: string
  label: string
  summary: string
  isPreset: boolean
  players: PlayerPos[]
}

interface PlayerRating {
  attack: number
  pass: number
  setpiece: number
  defense: number
  speed: number
  physical: number
}

// ============================================================
// 预设阵型数据（后端不可用时降级使用）
// ============================================================
const PRESET_FORMATIONS: FormationDef[] = [
  {
    id: 'f_433',
    label: '4-3-3',
    summary: '高位压迫 · 两翼齐飞',
    isPreset: true,
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 2, left: '22%', top: '20%', role: 'def', name: '王浩', pos: 'RB' },
      { no: 3, left: '22%', top: '40%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '22%', top: '60%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '22%', top: '80%', role: 'def', name: '刘洋', pos: 'LB' },
      { no: 6, left: '44%', top: '30%', role: 'mid', name: '周凯', pos: 'DM' },
      { no: 10, left: '44%', top: '50%', role: 'mid', name: '李明轩', pos: 'CAM', isKey: true },
      { no: 8, left: '44%', top: '70%', role: 'mid', name: '张伟', pos: 'CM' },
      { no: 7, left: '70%', top: '25%', role: 'fwd', name: '孙宇', pos: 'RW' },
      { no: 9, left: '70%', top: '50%', role: 'fwd', name: '张志远', pos: 'ST' },
      { no: 11, left: '70%', top: '75%', role: 'fwd', name: '王浩', pos: 'LW' },
    ],
  },
  {
    id: 'f_4231',
    label: '4-2-3-1',
    summary: '中场控制 · 单箭头',
    isPreset: true,
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 2, left: '22%', top: '20%', role: 'def', name: '王浩', pos: 'RB' },
      { no: 3, left: '22%', top: '40%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '22%', top: '60%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '22%', top: '80%', role: 'def', name: '刘洋', pos: 'LB' },
      { no: 6, left: '40%', top: '38%', role: 'mid', name: '周凯', pos: 'DM' },
      { no: 8, left: '40%', top: '62%', role: 'mid', name: '张伟', pos: 'DM' },
      { no: 7, left: '60%', top: '25%', role: 'fwd', name: '孙宇', pos: 'RW' },
      { no: 10, left: '60%', top: '50%', role: 'mid', name: '李明轩', pos: 'CAM', isKey: true },
      { no: 11, left: '60%', top: '75%', role: 'fwd', name: '王浩', pos: 'LW' },
      { no: 9, left: '78%', top: '50%', role: 'fwd', name: '张志远', pos: 'ST' },
    ],
  },
  {
    id: 'f_352',
    label: '3-5-2',
    summary: '边翼卫插上 · 双前锋',
    isPreset: true,
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
  {
    id: 'f_442',
    label: '4-4-2',
    summary: '传统平行 · 攻守均衡',
    isPreset: true,
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 2, left: '22%', top: '20%', role: 'def', name: '王浩', pos: 'RB' },
      { no: 3, left: '22%', top: '40%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '22%', top: '60%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '22%', top: '80%', role: 'def', name: '刘洋', pos: 'LB' },
      { no: 7, left: '50%', top: '15%', role: 'mid', name: '孙宇', pos: 'RM' },
      { no: 6, left: '50%', top: '40%', role: 'mid', name: '周凯', pos: 'CM' },
      { no: 10, left: '50%', top: '50%', role: 'mid', name: '李明轩', pos: 'CM', isKey: true },
      { no: 8, left: '50%', top: '60%', role: 'mid', name: '张伟', pos: 'CM' },
      { no: 11, left: '50%', top: '85%', role: 'mid', name: '王浩', pos: 'LM' },
      { no: 9, left: '75%', top: '40%', role: 'fwd', name: '张志远', pos: 'ST' },
      { no: 21, left: '75%', top: '60%', role: 'fwd', name: '刘洋', pos: 'ST' },
    ],
  },
  {
    id: 'f_4141',
    label: '4-1-4-1',
    summary: '单后腰 · 中场密集',
    isPreset: true,
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 2, left: '22%', top: '20%', role: 'def', name: '王浩', pos: 'RB' },
      { no: 3, left: '22%', top: '40%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '22%', top: '60%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '22%', top: '80%', role: 'def', name: '刘洋', pos: 'LB' },
      { no: 6, left: '38%', top: '50%', role: 'mid', name: '周凯', pos: 'DM' },
      { no: 7, left: '58%', top: '20%', role: 'mid', name: '孙宇', pos: 'RM' },
      { no: 10, left: '58%', top: '40%', role: 'mid', name: '李明轩', pos: 'CM', isKey: true },
      { no: 8, left: '58%', top: '60%', role: 'mid', name: '张伟', pos: 'CM' },
      { no: 11, left: '58%', top: '80%', role: 'mid', name: '王浩', pos: 'LM' },
      { no: 9, left: '78%', top: '50%', role: 'fwd', name: '张志远', pos: 'ST' },
    ],
  },
  {
    id: 'f_343',
    label: '3-4-3',
    summary: '三后卫 · 全攻全守',
    isPreset: true,
    players: [
      { no: 1, left: '7%', top: '50%', role: 'gk', name: '刘强', pos: 'GK' },
      { no: 3, left: '20%', top: '30%', role: 'def', name: '赵磊', pos: 'CB' },
      { no: 4, left: '20%', top: '50%', role: 'def', name: '陈刚', pos: 'CB' },
      { no: 5, left: '20%', top: '70%', role: 'def', name: '刘洋', pos: 'CB' },
      { no: 2, left: '40%', top: '20%', role: 'mid', name: '王浩', pos: 'RM' },
      { no: 6, left: '40%', top: '40%', role: 'mid', name: '周凯', pos: 'CM' },
      { no: 10, left: '40%', top: '50%', role: 'mid', name: '李明轩', pos: 'CM', isKey: true },
      { no: 8, left: '40%', top: '60%', role: 'mid', name: '张伟', pos: 'CM' },
      { no: 11, left: '40%', top: '80%', role: 'mid', name: '孙宇', pos: 'LM' },
      { no: 7, left: '72%', top: '25%', role: 'fwd', name: '王浩', pos: 'RW' },
      { no: 9, left: '72%', top: '50%', role: 'fwd', name: '张志远', pos: 'ST' },
      { no: 21, left: '72%', top: '75%', role: 'fwd', name: '刘洋', pos: 'LW' },
    ],
  },
]

// ============================================================
// 预设战术库（名帅风格）
// ============================================================
const PRESET_TACTICS = [
  { id: 'tl_1', name: '瓜迪奥拉式传控', coach: 'Pep Guardiola', formation: '4-3-3', description: '极致传控，高位压迫，边后卫内收', isPreset: true },
  { id: 'tl_2', name: '克洛普重金属足球', coach: 'Jurgen Klopp', formation: '4-3-3', description: 'gegenpressing，快速反击，两翼齐飞', isPreset: true },
  { id: 'tl_3', name: '穆里尼奥防守反击', coach: 'Jose Mourinho', formation: '4-2-3-1', description: '低位防守，快速反击，单箭头', isPreset: true },
  { id: 'tl_4', name: '安切洛蒂均衡战术', coach: 'Carlo Ancelotti', formation: '4-3-3', description: '攻守均衡，灵活变阵，明星球员自由发挥', isPreset: true },
  { id: 'tl_5', name: '孔蒂三后卫体系', coach: 'Antonio Conte', formation: '3-5-2', description: '3-5-2 体系，边翼卫插上，双前锋', isPreset: true },
]

// ============================================================
// AI 提示
// ============================================================
const AI_TIPS: Record<string, string[]> = {
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
  default: [
    '当前阵型适合控球战术，建议保持中场人数优势',
    '注意边路防守空当，及时补位',
    '前锋跑位灵活，可尝试直塞球撕开防线',
  ],
}

// ============================================================
// 默认球员能力值
// ============================================================
const DEFAULT_RATINGS: Record<number, PlayerRating> = {
  1: { attack: 4.0, pass: 6.5, setpiece: 5.0, defense: 8.0, speed: 6.0, physical: 7.0 },
  2: { attack: 6.0, pass: 7.0, setpiece: 5.5, defense: 7.5, speed: 8.0, physical: 6.5 },
  3: { attack: 4.5, pass: 6.5, setpiece: 5.0, defense: 8.5, speed: 6.5, physical: 8.5 },
  4: { attack: 4.5, pass: 6.5, setpiece: 5.0, defense: 8.5, speed: 6.5, physical: 8.5 },
  5: { attack: 6.0, pass: 7.0, setpiece: 5.5, defense: 7.5, speed: 8.0, physical: 6.5 },
  6: { attack: 6.5, pass: 8.0, setpiece: 6.0, defense: 7.5, speed: 7.0, physical: 7.5 },
  7: { attack: 8.5, pass: 7.5, setpiece: 7.0, defense: 5.0, speed: 9.0, physical: 6.5 },
  8: { attack: 7.0, pass: 8.0, setpiece: 6.5, defense: 7.0, speed: 7.5, physical: 7.0 },
  9: { attack: 9.0, pass: 7.0, setpiece: 7.5, defense: 4.0, speed: 8.5, physical: 8.0 },
  10: { attack: 8.5, pass: 9.0, setpiece: 8.5, defense: 5.5, speed: 8.0, physical: 6.5 },
  11: { attack: 8.5, pass: 7.5, setpiece: 7.0, defense: 5.0, speed: 9.0, physical: 6.5 },
  21: { attack: 8.0, pass: 6.5, setpiece: 6.0, defense: 5.5, speed: 8.0, physical: 7.5 },
}

const RATING_LABELS: { key: keyof PlayerRating; label: string }[] = [
  { key: 'attack', label: '进攻' },
  { key: 'pass', label: '传球' },
  { key: 'setpiece', label: '定位球' },
  { key: 'defense', label: '防守' },
  { key: 'speed', label: '速度' },
  { key: 'physical', label: '身体' },
]

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

// ============================================================
// 工具函数
// ============================================================
function calcPlayerRating(r: PlayerRating): number {
  const sum = r.attack + r.pass + r.setpiece + r.defense + r.speed + r.physical
  return Math.round((sum / 6) * 10) / 10
}

function calcFormationScore(players: PlayerPos[], ratings: Record<number, PlayerRating>): number {
  if (players.length === 0) return 0
  const scores = players.map((p) => {
    const r = ratings[p.no]
    return r ? calcPlayerRating(r) : 7.0
  })
  const sum = scores.reduce((a, b) => a + b, 0)
  return Math.round((sum / scores.length) * 10) / 10
}

// ============================================================
// 主组件
// ============================================================
export default function Tactics() {
  // 阵型管理
  const [formations, setFormations] = useState<FormationDef[]>(PRESET_FORMATIONS)
  const [currentFormationId, setCurrentFormationId] = useState<string>('f_433')
  const [formationDropdownOpen, setFormationDropdownOpen] = useState(false)

  // 视图模式
  const [view3D, setView3D] = useState(true)
  const [showNames, setShowNames] = useState(false)

  // 战术库
  const [tacticsList, setTacticsList] = useState<typeof PRESET_TACTICS>(PRESET_TACTICS)
  const [selectedTacticId, setSelectedTacticId] = useState<string>('')
  const [tacticsModalOpen, setTacticsModalOpen] = useState(false)

  // 球员能力编辑
  const [ratings, setRatings] = useState<Record<number, PlayerRating>>(DEFAULT_RATINGS)
  const [editingPlayerNo, setEditingPlayerNo] = useState<number | null>(null)

  // 自定义阵型
  const [customFormationModalOpen, setCustomFormationModalOpen] = useState(false)

  // 工具栏
  const [tool, setTool] = useState<string>('全景')
  const [bottomTool, setBottomTool] = useState<string | null>(null)

  const currentFormation = useMemo(
    () => formations.find((f) => f.id === currentFormationId) ?? formations[0],
    [formations, currentFormationId],
  )

  const formationScore = useMemo(
    () => calcFormationScore(currentFormation.players, ratings),
    [currentFormation, ratings],
  )

  const tips = AI_TIPS[currentFormation.label] ?? AI_TIPS.default

  // 从后端加载阵型和战术库（失败时降级使用预设数据）
  useEffect(() => {
    let cancelled = false
    const loadFromBackend = async () => {
      try {
        const [formationsData, tacticsData] = await Promise.all([
          formationApi.list(),
          tacticsApi.list(),
        ])
        if (cancelled) return
        // 合并后端阵型与本地预设（后端优先）
        if (formationsData && formationsData.length > 0) {
          const merged = mergeFormations(PRESET_FORMATIONS, formationsData)
          setFormations(merged)
        }
        if (tacticsData && tacticsData.length > 0) {
          setTacticsList(mergeTactics(PRESET_TACTICS, tacticsData))
        }
      } catch {
        // 后端不可用，使用预设数据
      }
    }
    loadFromBackend()
    return () => {
      cancelled = true
    }
  }, [])

  // 关闭下拉点击外部
  useEffect(() => {
    if (!formationDropdownOpen) return
    const handler = () => setFormationDropdownOpen(false)
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [formationDropdownOpen])

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <AppShell>
      {/* Top toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap items-center">
          {/* 阵型下拉选择 */}
          <div className="relative" style={{ minWidth: '160px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFormationDropdownOpen(!formationDropdownOpen)
              }}
              className="h-8 px-3 rounded-md text-sm flex items-center gap-2 whitespace-nowrap transition-colors"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <GitBranch className="w-3.5 h-3.5" style={{ color: 'var(--secondary)' }} />
              <span className="font-medium mono">{currentFormation.label}</span>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
            </button>
            {formationDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 rounded-md overflow-hidden z-20"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  minWidth: '240px',
                }}
              >
                {formations.map((f) => (
                  <button
                    key={f.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentFormationId(f.id)
                      setFormationDropdownOpen(false)
                    }}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[var(--card-elevated)] transition-colors"
                    style={{
                      background: f.id === currentFormationId ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium mono" style={{ color: 'var(--foreground)' }}>{f.label}</span>
                      {f.isPreset ? (
                        <span className="chip chip-cyan" style={{ height: '20px' }}>预设</span>
                      ) : (
                        <span className="chip" style={{ height: '20px' }}>自定义</span>
                      )}
                    </div>
                    <span className="text-xs truncate ml-2" style={{ color: 'var(--muted-foreground)' }}>{f.summary}</span>
                  </button>
                ))}
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFormationDropdownOpen(false)
                      setCustomFormationModalOpen(true)
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[var(--card-elevated)] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" style={{ color: 'var(--secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--secondary)' }}>自定义阵型</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2D/3D 切换 */}
          <div
            className="h-8 rounded-md flex items-center p-0.5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setView3D(false)}
              className="h-7 px-3 rounded text-xs font-medium transition"
              style={
                !view3D
                  ? { background: 'var(--primary)', color: 'var(--on-accent)' }
                  : { color: 'var(--muted-foreground)' }
              }
            >
              2D
            </button>
            <button
              onClick={() => setView3D(true)}
              className="h-7 px-3 rounded text-xs font-medium transition"
              style={
                view3D
                  ? { background: 'var(--primary)', color: 'var(--on-accent)' }
                  : { color: 'var(--muted-foreground)' }
              }
            >
              3D
            </button>
          </div>

          {/* 号码/名称切换 */}
          <button
            onClick={() => setShowNames(!showNames)}
            className="h-8 px-3 rounded-md text-xs flex items-center gap-1.5 whitespace-nowrap transition-colors"
            style={
              showNames
                ? { background: 'var(--secondary)', color: 'var(--on-accent)', border: '1px solid var(--secondary)' }
                : { color: 'var(--foreground)', border: '1px solid var(--border)', background: 'transparent' }
            }
          >
            <Users className="w-3.5 h-3.5" />
            <span>{showNames ? '显示号码' : '显示名称'}</span>
          </button>
        </div>

        {/* 右侧工具 */}
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
              perspective: view3D ? '1000px' : 'none',
            }}
          >
            {/* Grass + 3D transform */}
            <div
              className="absolute inset-0"
              style={{
                transform: view3D ? 'rotateX(35deg)' : 'none',
                transformOrigin: 'center bottom',
                transition: 'transform 0.4s ease',
                background: 'repeating-linear-gradient(90deg, #1a4d2c 0px, #1a4d2c 60px, #246b3a 60px, #246b3a 120px)',
              }}
            >
              {/* Field markings */}
              <div className="absolute" style={{ inset: '4%', border: '2px solid rgba(255,255,255,0.4)' }}>
                <div className="absolute" style={{ left: '50%', top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.4)', transform: 'translateX(-50%)' }} />
                <div className="absolute rounded-full" style={{ left: '50%', top: '50%', width: '18%', aspectRatio: '1/1', border: '2px solid rgba(255,255,255,0.4)', transform: 'translate(-50%, -50%)' }} />
                <div className="absolute rounded-full" style={{ left: '50%', top: '50%', width: '6px', height: '6px', background: 'rgba(255,255,255,0.65)', transform: 'translate(-50%, -50%)' }} />
                <div className="absolute" style={{ left: 0, top: '50%', width: '16%', height: '56%', border: '2px solid rgba(255,255,255,0.4)', borderLeft: 0, transform: 'translateY(-50%)' }} />
                <div className="absolute" style={{ right: 0, top: '50%', width: '16%', height: '56%', border: '2px solid rgba(255,255,255,0.4)', borderRight: 0, transform: 'translateY(-50%)' }} />
                <div className="absolute" style={{ left: 0, top: '50%', width: '7%', height: '30%', border: '2px solid rgba(255,255,255,0.4)', borderLeft: 0, transform: 'translateY(-50%)' }} />
                <div className="absolute" style={{ right: 0, top: '50%', width: '7%', height: '30%', border: '2px solid rgba(255,255,255,0.4)', borderRight: 0, transform: 'translateY(-50%)' }} />
              </div>

              {/* Players */}
              {currentFormation.players.map((p) => {
                const isGk = p.role === 'gk'
                const isKey = p.isKey
                const playerRating = ratings[p.no] ? calcPlayerRating(ratings[p.no]) : 0
                return (
                  <div
                    key={p.no}
                    onClick={() => setEditingPlayerNo(p.no)}
                    className="absolute rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                    style={{
                      left: p.left,
                      top: p.top,
                      transform: 'translate(-50%, -50%)',
                      width: showNames ? 'auto' : '40px',
                      height: '40px',
                      minWidth: '40px',
                      padding: showNames ? '0 10px' : '0',
                      background: isGk
                        ? 'color-mix(in srgb, var(--secondary) 70%, transparent)'
                        : isKey
                          ? 'var(--secondary)'
                          : 'var(--primary)',
                      color: 'var(--on-media)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: showNames ? '11px' : '13px',
                      fontWeight: 600,
                      boxShadow: isKey
                        ? '0 0 16px color-mix(in srgb, var(--secondary) 60%, transparent), 0 2px 8px rgba(0,0,0,0.35)'
                        : '0 2px 8px rgba(0,0,0,0.35)',
                      border: isKey ? '2px solid rgba(255,255,255,0.85)' : 'none',
                      whiteSpace: 'nowrap',
                    }}
                    title={`${p.no} · ${p.name ?? ''} · ${p.pos ?? ''} · 评分 ${playerRating}`}
                  >
                    {showNames ? (p.name ?? p.no) : p.no}
                  </div>
                )
              })}
            </div>

            {/* 阵型总分 - 右上角 */}
            <div
              className="absolute top-3 right-3 rounded-md px-3 py-2"
              style={{
                background: 'color-mix(in srgb, var(--background) 80%, transparent)',
                border: '1px solid var(--border)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <div className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>阵型总分</div>
              <div className="text-2xl leading-tight whitespace-nowrap mono font-bold" style={{ color: 'var(--secondary)' }}>
                {formationScore.toFixed(1)}
              </div>
              <div className="text-xs whitespace-nowrap mono mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                {currentFormation.label} · {currentFormation.players.length}人
              </div>
            </div>

            {/* 比分 */}
            <div
              className="absolute top-3 left-3 rounded-md px-3 py-2"
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
            <div className="mt-2 text-2xl font-bold mono" style={{ color: 'var(--secondary)' }}>{currentFormation.label}</div>
            <div className="text-xs mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>{currentFormation.summary}</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Stat label="控球率" value="58%" />
              <Stat label="传球成功率" value="87%" />
              <Stat label="射门" value="12 次" />
              <Stat label="角球" value="5 次" />
            </div>
          </div>

          {/* 战术库 */}
          <div className="rounded-lg p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 shrink-0" style={{ color: 'var(--primary)' }} />
              <span className="text-sm font-semibold flex-1" style={{ color: 'var(--foreground)' }}>教练战术库</span>
              <button
                onClick={() => setTacticsModalOpen(true)}
                className="w-6 h-6 rounded flex items-center justify-center transition hover:bg-[var(--card-elevated)]"
                style={{ color: 'var(--secondary)' }}
                aria-label="添加战术"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
              {tacticsList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTacticId(t.id === selectedTacticId ? '' : t.id)}
                  className="text-left p-2 rounded transition-colors"
                  style={{
                    background: t.id === selectedTacticId ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--card-elevated)',
                    border: t.id === selectedTacticId ? '1px solid var(--primary)' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm truncate flex-1" style={{ color: 'var(--foreground)' }}>{t.name}</span>
                    {t.isPreset && (
                      <span className="chip chip-cyan" style={{ height: '18px', fontSize: '10px' }}>预设</span>
                    )}
                  </div>
                  <div className="text-xs truncate mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {t.coach} · {t.formation}
                  </div>
                </button>
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
          <button
            onClick={() => setEditingPlayerNo(currentFormation.players[0]?.no ?? null)}
            className="h-9 px-3 sm:px-4 rounded-full flex items-center gap-2 text-sm whitespace-nowrap transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)', background: 'transparent' }}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>编辑球员能力</span>
          </button>
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

      {/* 球员能力编辑弹窗 */}
      {editingPlayerNo !== null && (
        <PlayerRatingModal
          playerNo={editingPlayerNo}
          playerName={currentFormation.players.find((p) => p.no === editingPlayerNo)?.name ?? `#${editingPlayerNo}`}
          playerPos={currentFormation.players.find((p) => p.no === editingPlayerNo)?.pos ?? ''}
          rating={ratings[editingPlayerNo] ?? { attack: 5, pass: 5, setpiece: 5, defense: 5, speed: 5, physical: 5 }}
          onClose={() => setEditingPlayerNo(null)}
          onSave={(newRating) => {
            setRatings((prev) => ({ ...prev, [editingPlayerNo]: newRating }))
            setEditingPlayerNo(null)
          }}
        />
      )}

      {/* 战术库自定义弹窗 */}
      {tacticsModalOpen && (
        <TacticsModal
          formations={formations}
          onClose={() => setTacticsModalOpen(false)}
          onSave={(name, coach, formationId, description) => {
            const newTactic = {
              id: `tl_custom_${Date.now()}`,
              name,
              coach: coach || '自定义',
              formation: formations.find((f) => f.id === formationId)?.label ?? '',
              description,
              isPreset: false,
            }
            setTacticsList((prev) => [...prev, newTactic])
            setTacticsModalOpen(false)
          }}
        />
      )}

      {/* 自定义阵型弹窗 */}
      {customFormationModalOpen && (
        <CustomFormationModal
          onClose={() => setCustomFormationModalOpen(false)}
          onSave={(name, summary) => {
            const newId = `f_custom_${Date.now()}`
            const newFormation: FormationDef = {
              id: newId,
              label: name,
              summary: summary || '自定义阵型',
              isPreset: false,
              players: PRESET_FORMATIONS[0].players,
            }
            setFormations((prev) => [...prev, newFormation])
            setCurrentFormationId(newId)
            setCustomFormationModalOpen(false)
          }}
        />
      )}
    </AppShell>
  )
}

// ============================================================
// 子组件：Stat
// ============================================================
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
      <div className="text-lg whitespace-nowrap mono" style={{ color: 'var(--foreground)' }}>{value}</div>
    </div>
  )
}

// ============================================================
// 子组件：球员能力编辑弹窗
// ============================================================
function PlayerRatingModal({
  playerNo,
  playerName,
  playerPos,
  rating,
  onClose,
  onSave,
}: {
  playerNo: number
  playerName: string
  playerPos: string
  rating: PlayerRating
  onClose: () => void
  onSave: (r: PlayerRating) => void
}) {
  const [local, setLocal] = useState<PlayerRating>({ ...rating })

  const total = calcPlayerRating(local)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-lg p-5 w-full max-w-md"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mono font-bold"
              style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
            >
              {playerNo}
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{playerName}</div>
              <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{playerPos}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 p-3 rounded" style={{ background: 'var(--card-elevated)' }}>
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>总评分</span>
          <span className="text-2xl font-bold mono" style={{ color: 'var(--secondary)' }}>{total.toFixed(1)}</span>
        </div>

        <div className="flex flex-col gap-3">
          {RATING_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm w-16 shrink-0" style={{ color: 'var(--foreground)' }}>{label}</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={local[key]}
                onChange={(e) => setLocal((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                className="flex-1"
                style={{ accentColor: 'var(--secondary)' }}
              />
              <span className="text-sm mono w-10 text-right" style={{ color: 'var(--secondary)' }}>
                {local[key].toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md text-sm transition"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            取消
          </button>
          <button
            onClick={() => onSave(local)}
            className="flex-1 h-9 rounded-md text-sm font-medium transition hover:brightness-110"
            style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 子组件：战术库自定义弹窗
// ============================================================
function TacticsModal({
  formations,
  onClose,
  onSave,
}: {
  formations: FormationDef[]
  onClose: () => void
  onSave: (name: string, coach: string, formationId: string, description: string) => void
}) {
  const [name, setName] = useState('')
  const [coach, setCoach] = useState('')
  const [formationId, setFormationId] = useState(formations[0]?.id ?? '')
  const [description, setDescription] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-lg p-5 w-full max-w-md"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>添加自定义战术</span>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted-foreground)' }}>战术名称 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：高位逼抢 + 快速反击"
              className="w-full h-9 px-3 rounded text-sm outline-none"
              style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted-foreground)' }}>教练风格</label>
            <input
              value={coach}
              onChange={(e) => setCoach(e.target.value)}
              placeholder="如：李教练"
              className="w-full h-9 px-3 rounded text-sm outline-none"
              style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted-foreground)' }}>适用阵型</label>
            <select
              value={formationId}
              onChange={(e) => setFormationId(e.target.value)}
              className="w-full h-9 px-3 rounded text-sm outline-none"
              style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              {formations.map((f) => (
                <option key={f.id} value={f.id}>{f.label} - {f.summary}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted-foreground)' }}>战术描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="战术要点和执行细节..."
              rows={3}
              className="w-full p-3 rounded text-sm outline-none resize-none"
              style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md text-sm transition"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            取消
          </button>
          <button
            onClick={() => name.trim() && onSave(name, coach, formationId, description)}
            disabled={!name.trim()}
            className="flex-1 h-9 rounded-md text-sm font-medium transition hover:brightness-110 disabled:opacity-50"
            style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 子组件：自定义阵型弹窗
// ============================================================
function CustomFormationModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (name: string, summary: string) => void
}) {
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-lg p-5 w-full max-w-md"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>自定义阵型</span>
          <button onClick={onClose} className="w-8 h-8 rounded flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted-foreground)' }}>阵型名称 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：4-1-2-1-2"
              className="w-full h-9 px-3 rounded text-sm outline-none mono"
              style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted-foreground)' }}>战术概述</label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="如：菱形中场 · 双前锋"
              className="w-full h-9 px-3 rounded text-sm outline-none"
              style={{ background: 'var(--card-elevated)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="text-xs p-3 rounded" style={{ background: 'var(--card-elevated)', color: 'var(--muted-foreground)' }}>
            提示：新建阵型将基于 4-3-3 的球员位置，可在创建后进入编辑模式调整。
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md text-sm transition"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            取消
          </button>
          <button
            onClick={() => name.trim() && onSave(name, summary)}
            disabled={!name.trim()}
            className="flex-1 h-9 rounded-md text-sm font-medium transition hover:brightness-110 disabled:opacity-50"
            style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 辅助函数：合并后端与本地数据
// ============================================================
function mergeFormations(local: FormationDef[], remote: Formation[]): FormationDef[] {
  const result = [...local]
  for (const r of remote) {
    // 如果后端阵型 id 不在本地，尝试解析 positions
    if (!result.find((f) => f.id === r.id)) {
      try {
        const positions = typeof r.positions === 'string' ? JSON.parse(r.positions) : r.positions
        result.push({
          id: r.id,
          label: r.name,
          summary: r.summary || '',
          isPreset: r.isPreset === 1,
          players: positions.map((p: PlayerPos) => ({ ...p, no: Number(p.no) })),
        })
      } catch {
        // 解析失败，跳过
      }
    }
  }
  return result
}

function mergeTactics(local: typeof PRESET_TACTICS, remote: TacticsLibrary[]): typeof PRESET_TACTICS {
  const result = [...local]
  for (const r of remote) {
    if (!result.find((t) => t.id === r.id)) {
      result.push({
        id: r.id,
        name: r.name,
        coach: r.coach || '自定义',
        formation: '',
        description: r.description || '',
        isPreset: r.isPreset === 1,
      })
    }
  }
  return result
}
