import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Briefcase,
  CalendarCheck,
  ChartLine,
  ClipboardList,
  Crown,
  Database,
  Download,
  FileDown,
  FileText,
  GitBranch,
  Headphones,
  HeartPulse,
  LayoutDashboard,
  Layers,
  Lightbulb,
  ListChecks,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Quote,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  Star,
  Tablet,
  Target,
  Trophy,
  User,
  UserCheck,
  Users,
  UsersRound,
} from 'lucide-react'
import heroImg from '../assets/hero-pitch.jpg'

const NAV_LINKS = [
  { href: '#overview', label: '平台总览' },
  { href: '#architecture', label: '三端架构' },
  { href: '#roles', label: '角色工作台' },
  { href: '#tactics', label: '战术看板' },
  { href: '#ai', label: 'AI 能力' },
  { href: '#tech', label: '技术架构' },
  { href: '#roadmap', label: '实施路径' },
]

const VALUE_CARDS = [
  {
    icon: BarChart3,
    accent: 'primary',
    title: '数据驱动决策',
    desc: '用统一数据底座替代经验直觉，让每一次首发、换人、训练计划都有据可依。从主席到教练，共享同一套可信指标。',
    chips: ['统一指标', '实时回看', '归因可溯'],
  },
  {
    icon: Users,
    accent: 'secondary',
    title: '全角色协同',
    desc: '主席、总经理、教练、球员、医疗、数据……八种角色同一平台协作，信息零时差流转。指令下发与执行反馈在同一张数据网上闭环。',
    chips: ['三端同步', '权限隔离', '消息驱动'],
  },
  {
    icon: Sparkles,
    accent: 'primary',
    title: 'AI 智能参谋',
    desc: '九大 AI 智能体覆盖赛前预测、赛中建议、赛后复盘，把专家经验沉淀为可复用能力。模型持续学习俱乐部自身数据，越用越懂你。',
    chips: ['九大智能体', '私有模型', '闭环学习'],
  },
]

const ARCH_THREE_ENDS = [
  {
    icon: Monitor,
    accent: 'primary',
    title: '管理端 PC',
    sub: 'Chairman · GM',
    no: '01',
    items: ['战略仪表盘与 KPI', '财务与人事全局', '青训体系与梯队', '商务运营与合规'],
  },
  {
    icon: Tablet,
    accent: 'secondary',
    title: '教练端 Pad',
    sub: 'Coach · Assistant',
    no: '02',
    items: ['战术布置与阵型', '训练计划与负荷', '实时数据看板', '视频回看与标注'],
  },
  {
    icon: Smartphone,
    accent: 'primary',
    title: '球员端 App',
    sub: 'Player',
    no: '03',
    items: ['个人数据与雷达', '训练任务执行', '健康自报与反馈', '战术指令接收'],
  },
]

const ROLES = [
  { icon: Crown, accent: 'primary', name: '俱乐部主席', desc: '战略决策与资源统筹，把控俱乐部全局方向。', chips: ['战略仪表盘', '投资回报', '财务健康'] },
  { icon: Briefcase, accent: 'secondary', name: '总经理', desc: '运营全局与商业落地，确保预算与执行对齐。', chips: ['预算执行', '商务合作', '合规审计'] },
  { icon: ClipboardList, accent: 'primary', name: '主教练', desc: '战术与比赛决策，掌控阵容与临场调度。', chips: ['阵容推荐', '战术看板', '赛后复盘'] },
  { icon: ListChecks, accent: 'secondary', name: '助理教练', desc: '训练执行与协助，落实计划并跟踪球员状态。', chips: ['训练计划', '球员状态', '视频分析'] },
  { icon: User, accent: 'primary', name: '球员', desc: '个人表现与执行，专注自身状态与任务。', chips: ['个人数据', '训练任务', '健康反馈'] },
  { icon: Sprout, accent: 'secondary', name: '青训主管', desc: '梯队建设与选拔，追踪年轻球员成长曲线。', chips: ['青训档案', '成长曲线', '选拔评估'] },
  { icon: HeartPulse, accent: 'primary', name: '医疗康复', desc: '伤病管理与康复，保障球员健康与出场可用。', chips: ['伤病预警', '康复计划', '负荷监控'] },
  { icon: ChartLine, accent: 'secondary', name: '数据分析', desc: '数据洞察与建模，把数据转化为可执行建议。', chips: ['数据归因', '对手分析', '模型建设'] },
]

const AI_AGENTS = [
  { icon: Trophy, name: '赛事预测', desc: '基于历史交锋与实时状态，预测比赛走势与胜负概率。', no: '01' },
  { icon: UsersRound, name: '阵容推荐', desc: '综合对手、体能、伤停，给出最优首发与替补方案。', no: '02' },
  { icon: HeartPulse, name: '伤病预警', desc: '监控训练负荷与生理指标，提前识别伤病风险。', no: '03' },
  { icon: Activity, name: '训练负荷', desc: '动态调整训练强度，平衡竞技状态与疲劳恢复。', no: '04' },
  { icon: Target, name: '对手分析', desc: '解构对手战术习惯与关键球员，输出针对性策略。', no: '05' },
  { icon: ClipboardList, name: '战术建议', desc: '实时给出换人、阵型调整、定位球方案建议。', no: '06' },
  { icon: UserCheck, name: '球员评估', desc: '多维雷达评估球员能力与潜力，辅助转会决策。', no: '07' },
  { icon: GitBranch, name: '数据归因', desc: '自动归因比赛胜负关键因素，定位改进方向。', no: '08' },
  { icon: FileText, name: '复盘报告', desc: '赛后自动生成结构化复盘报告与行动清单。', no: '09' },
]

const TECH_LAYERS = [
  { icon: Radio, accent: 'primary', layer: 'Layer 01', name: '感知层', chips: ['IoT 传感器', '可穿戴设备', '视频采集', 'GPS 追踪', '生理指标'] },
  { icon: Database, accent: 'secondary', layer: 'Layer 02', name: '数据层', chips: ['数据湖', 'ETL 管道', '实时流', '数据仓库'] },
  { icon: Layers, accent: 'primary', layer: 'Layer 03', name: '平台层', chips: ['微服务', 'API 网关', '权限中心', '消息队列'] },
  { icon: BrainCircuit, accent: 'secondary', layer: 'Layer 04', name: '模型层', chips: ['模型训练', '特征仓库', '模型注册', '推理服务'] },
  { icon: LayoutDashboard, accent: 'primary', layer: 'Layer 05', name: '应用层', chips: ['工作台', '仪表盘', '报表', '告警'] },
]

const ROADMAP = [
  {
    phase: 'Phase 01',
    duration: '0 - 3 月',
    tag: '基础数字化',
    tagClass: 'red',
    title: '数据看得见',
    desc: '完成数据采集接入与角色工作台 MVP，打通单端试运行，建立统一指标口径。',
    items: ['数据采集与接入', '角色工作台 MVP', '单端试运行', '指标口径统一'],
    metric: '≥80%',
    metricLabel: '数据覆盖率',
    accent: 'primary',
  },
  {
    phase: 'Phase 02',
    duration: '3 - 6 月',
    tag: '智能化',
    tagClass: 'default',
    title: '数据用得上',
    desc: 'AI 能力分批上线，三端协同打通，战术看板进入日常使用，教练决策开始有据可依。',
    items: ['AI 能力上线', '三端协同', '战术看板', '对手分析库'],
    metric: '≥60%',
    metricLabel: 'AI 建议采纳率',
    accent: 'mixed',
  },
  {
    phase: 'Phase 03',
    duration: '6 - 12 月',
    tag: '决策闭环',
    tagClass: 'cyan',
    title: '数据能决策',
    desc: '决策智能体上线，全链路归因与自动化复盘跑通，从感知到决策形成完整闭环。',
    items: ['决策智能体', '全链路归因', '自动化复盘', '私有模型沉淀'],
    metric: '≤5分钟',
    metricLabel: '决策响应',
    accent: 'secondary',
  },
]

export default function Overview() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="min-h-screen font-sans antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Sticky nav */}
      <nav
        className="sticky top-0 z-50 transition-all"
        style={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          background: scrolled ? 'color-mix(in srgb, var(--background) 78%, transparent)' : 'color-mix(in srgb, var(--background) 55%, transparent)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <a href="#overview" className="flex items-center gap-2 shrink-0">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-md"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
              >
                <Activity className="h-4 w-4" style={{ color: 'var(--on-accent)' }} />
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-foreground">数智绿茵</span>
              <span className="hidden sm:inline kicker">FOOTBALL OS</span>
            </a>
            <div className="hidden lg:flex items-center gap-1 text-sm">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="px-3 py-2 rounded-md truncate transition-colors hover:text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--on-media)_5%,transparent)]" style={{ color: 'var(--muted-foreground)' }}>
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/app/dashboard"
                className="hidden md:inline-flex h-9 items-center rounded-full px-4 text-sm font-medium border transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
                style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                进入工作台
              </Link>
              <a
                href="#trust"
                className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium bg-primary text-primary-foreground transition hover:opacity-90"
              >
                预约演示
              </a>
              <button
                className="lg:hidden w-9 h-9 rounded-md flex items-center justify-center"
                style={{ color: 'var(--foreground)' }}
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label="切换导航"
              >
                <ListChecks className="w-5 h-5" />
              </button>
            </div>
          </div>
          {mobileNavOpen && (
            <div className="lg:hidden pb-3 grid grid-cols-2 gap-1 text-sm">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="px-3 py-2 rounded-md truncate"
                  style={{ color: 'var(--muted-foreground)', background: 'color-mix(in srgb, var(--card) 50%, transparent)' }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section id="overview" className="relative overflow-hidden" style={{ minHeight: 'min(92vh, 760px)' }}>
        <img src={heroImg} alt="夜场足球场数据节点主视觉" className="absolute inset-0 w-full h-full object-cover object-center" style={{ filter: 'brightness(.74) saturate(.92)' }} />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--background) 55%, transparent) 0%, color-mix(in srgb, var(--background) 80%, transparent) 55%, color-mix(in srgb, var(--background) 97%, transparent) 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--background) 85%, transparent) 0%, color-mix(in srgb, var(--background) 45%, transparent) 55%, color-mix(in srgb, var(--background) 12%, transparent) 100%)' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ top: '-140px', right: '-140px', width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent) 0%, color-mix(in srgb, var(--primary) 0%, transparent) 70%)' }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ bottom: '-180px', left: '-120px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--secondary) 16%, transparent) 0%, color-mix(in srgb, var(--secondary) 0%, transparent) 70%)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="kicker" style={{ color: 'var(--primary)' }}>Intelligent Football Platform</span>
                <span className="h-px w-10" style={{ background: 'var(--primary)' }} />
                <span className="kicker">v2026 · 客户提案</span>
              </div>
              <h1 className="display-h text-foreground font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                让数据学会思考<br />
                <span className="text-foreground">数智绿茵</span>
                <span style={{ color: 'var(--secondary)' }}> · </span>
                <span className="text-foreground">决胜每一寸场地</span>
              </h1>
              <p className="mt-6 sm:mt-7 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
                面向现代足球俱乐部的数智化中枢。以统一数据底座打通管理、教练、球员三端，融合九大 AI 智能体能力，把训练负荷、战术选择、伤病预警、对手分析沉淀为可复用的决策资产，让每一场比赛都站在数据的肩膀上。
              </p>
              <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/app/dashboard"
                  className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium bg-primary text-primary-foreground transition hover:opacity-90"
                >
                  <CalendarCheck className="h-4 w-4" />进入工作台
                </Link>
                <a
                  href="#trust"
                  className="inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium text-foreground border transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Download className="h-4 w-4" />下载方案
                </a>
                <div className="hidden sm:flex items-center gap-2 pl-3 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" style={{ color: 'var(--secondary)' }} />
                  <span className="truncate">已服务 12+ 职业俱乐部</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <div
                className="rounded-lg p-5 w-full max-w-xs"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  background: 'color-mix(in srgb, var(--card) 74%, transparent)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="kicker">Platform Index</span>
                  <Layers className="h-4 w-4" style={{ color: 'var(--secondary)' }} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm text-muted-foreground">AI 能力</span>
                    <span className="mono text-2xl font-semibold" style={{ color: 'var(--secondary)' }}>
                      9<span className="text-sm text-muted-foreground ml-1">大</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm text-muted-foreground">角色工作台</span>
                    <span className="mono text-2xl font-semibold text-foreground">
                      8<span className="text-sm text-muted-foreground ml-1">大</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">技术架构</span>
                    <span className="mono text-2xl font-semibold" style={{ color: 'var(--primary)' }}>
                      6<span className="text-sm text-muted-foreground ml-1">层</span>
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 text-[11px] text-muted-foreground mono" style={{ borderTop: '1px solid var(--border)' }}>
                  3-END · UNIFIED DATA CORE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value */}
      <Section id="value">
        <SectionHead kicker="Why Us" kickerColor="primary" title="为现代足球俱乐部打造的数智化中枢" desc="不再是被动的报表工具，而是贯穿战略、训练、比赛、康复全链路的决策伙伴。三大核心价值，重塑俱乐部运营底座。" />
        <div className="grid md:grid-cols-3 gap-5">
          {VALUE_CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-lg p-7 transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = c.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-md mb-5"
                style={{
                  border: '1px solid var(--border)',
                  background: c.accent === 'primary'
                    ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                    : 'color-mix(in srgb, var(--secondary) 8%, transparent)',
                }}
              >
                <c.icon className="h-5 w-5" style={{ color: c.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)' }} />
              </div>
              <h3 className="text-foreground font-semibold text-xl mb-3">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {c.chips.map((ch) => (
                  <span key={ch} className="chip chip-mono">{ch}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Architecture */}
      <Section id="architecture" bg="var(--card)">
        <SectionHead
          kicker="Architecture"
          kickerColor="secondary"
          title="三端协同 · 一体化数据中枢"
          desc="管理端、教练端、球员端三入口共享同一数据中台，采集、计算、决策在同一张数据网上完成，杜绝信息孤岛与口径分歧。"
        />
        <div>
          <div className="grid md:grid-cols-3 gap-5">
            {ARCH_THREE_ENDS.map((e) => (
              <div key={e.no} className="rounded-lg p-6" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-md"
                      style={{
                        border: '1px solid var(--border)',
                        background: e.accent === 'primary'
                          ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                          : 'color-mix(in srgb, var(--secondary) 8%, transparent)',
                      }}
                    >
                      <e.icon className="h-5 w-5" style={{ color: e.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)' }} />
                    </span>
                    <div>
                      <div className="text-foreground font-semibold">{e.title}</div>
                      <div className="kicker">{e.sub}</div>
                    </div>
                  </div>
                  <span className={`chip chip-mono ${e.accent === 'primary' ? 'chip-red' : 'chip-cyan'}`}>{e.no}</span>
                </div>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {e.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 truncate">
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0"
                        style={{
                          background: e.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)',
                          opacity: 0.85,
                        }}
                      />
                      <span className="truncate">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="hidden md:flex justify-center my-2">
            <div className="flex flex-col items-center">
              <div className="h-8 w-px" style={{ background: 'linear-gradient(180deg, var(--primary), var(--secondary))', opacity: 0.55 }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--secondary)', border: '2px solid var(--background)' }} />
            </div>
          </div>

          <div
            className="rounded-lg p-7"
            style={{
              borderColor: 'color-mix(in srgb, var(--secondary) 35%, transparent)',
              borderWidth: 1,
              borderStyle: 'solid',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 4%, transparent) 0%, color-mix(in srgb, var(--secondary) 5%, transparent) 100%)',
            }}
          >
            <div className="grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-md"
                    style={{ border: '1px solid var(--border)', background: 'var(--background)' }}
                  >
                    <Database className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                  </span>
                  <div>
                    <div className="text-foreground font-semibold text-lg">中央数据中台</div>
                    <div className="kicker">Unified Data Core</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  三端数据在此汇聚、清洗、建模，向下游 AI 引擎与应用层统一供给。一套指标口径，一份可信数据资产。
                </p>
              </div>
              <div className="md:col-span-7 grid grid-cols-2 gap-3">
                <div className="rounded-md p-4" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                  <div className="kicker mb-2">数据湖</div>
                  <div className="mono text-2xl font-semibold text-foreground">12<span className="text-sm text-muted-foreground ml-1">域</span></div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">赛事 / 训练 / 体能 / 医疗</div>
                </div>
                <div className="rounded-md p-4" style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                  <div className="kicker mb-2" style={{ color: 'var(--secondary)' }}>AI 引擎</div>
                  <div className="mono text-2xl font-semibold" style={{ color: 'var(--secondary)' }}>9<span className="text-sm text-muted-foreground ml-1">模型</span></div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">预测 / 推荐 / 归因 / 预警</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Roles */}
      <Section id="roles">
        <SectionHead
          kicker="Roles"
          kickerColor="primary"
          title="八大角色 · 各司其职"
          desc="每个角色拥有专属工作台，看见自己关心的数据，执行自己负责的决策。权限隔离，信息贯通。"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((r, i) => (
            <div
              key={r.name}
              className="rounded-lg p-5 transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = r.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-md"
                  style={{
                    border: '1px solid var(--border)',
                    background: r.accent === 'primary'
                      ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                      : 'color-mix(in srgb, var(--secondary) 8%, transparent)',
                  }}
                >
                  <r.icon className="h-5 w-5" style={{ color: r.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)' }} />
                </span>
                <span className="chip chip-mono">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="text-foreground font-semibold mb-1.5 truncate">{r.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{r.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {r.chips.map((ch) => (
                  <span key={ch} className="chip chip-mono">{ch}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Tactics preview */}
      <Section id="tactics" bg="var(--card)">
        <SectionHead
          kicker="Tactics"
          kickerColor="primary"
          title="所见即所战 · 沉浸式战术看板"
          desc="教练端核心工作台。可视化阵型布置、实时球员评分与 AI 战术建议同屏呈现，临场决策一屏即达。"
        />
        <TacticsPreview />
      </Section>

      {/* AI Agents */}
      <Section id="ai">
        <SectionHead
          kicker="AI Agent"
          kickerColor="secondary"
          title="AI 参谋 · 九大智能能力"
          desc="九大智能体覆盖赛前、赛中、赛后全周期，把专家经验沉淀为可复用模型。青色信号代表数据与智能在持续运转。"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_AGENTS.map((a) => (
            <div
              key={a.name}
              className="rounded-lg p-6 transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-md mb-4"
                style={{ border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--secondary) 8%, transparent)' }}
              >
                <a.icon className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="chip chip-cyan chip-mono">{a.no}</span>
                <h3 className="text-foreground font-semibold">{a.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Tech layers */}
      <Section id="tech" bg="var(--card)">
        <SectionHead
          kicker="Tech Stack"
          kickerColor="secondary"
          title="六层技术架构 · 从感知到决策"
          desc="自下而上的六层架构，从球场边的传感器到顶层的决策智能体，每一层都可独立演进、可被替换。"
        />
        <div className="space-y-0">
          {TECH_LAYERS.map((l, idx) => (
            <div key={l.layer}>
              <div
                className="rounded-lg p-5 transition-colors"
                style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--secondary)'
                  e.currentTarget.style.background = 'color-mix(in srgb, var(--secondary) 4%, transparent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--background)'
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                  <div className="md:w-56 shrink-0 flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-md"
                      style={{
                        border: '1px solid var(--border)',
                        background: l.accent === 'primary'
                          ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                          : 'color-mix(in srgb, var(--secondary) 8%, transparent)',
                      }}
                    >
                      <l.icon className="h-5 w-5" style={{ color: l.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)' }} />
                    </span>
                    <div>
                      <div className="kicker">{l.layer}</div>
                      <div className="text-foreground font-semibold">{l.name}</div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {l.chips.map((c) => (
                      <span key={c} className="chip chip-mono">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              {idx < TECH_LAYERS.length - 1 && (
                <>
                  <div className="w-px h-3.5 mx-auto" style={{ background: 'var(--border)' }} />
                  <div className="w-px h-3.5 mx-auto" style={{ background: 'var(--border)' }} />
                </>
              )}
            </div>
          ))}
          {/* Decision layer (L6) — highlighted */}
          <div
            className="rounded-lg p-5"
            style={{
              borderColor: 'color-mix(in srgb, var(--secondary) 35%, transparent)',
              borderWidth: 1,
              borderStyle: 'solid',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--secondary) 4%, transparent) 0%, color-mix(in srgb, var(--secondary) 0%, transparent) 100%)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="md:w-56 shrink-0 flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-md"
                  style={{ border: '1px solid var(--border)', background: 'var(--background)' }}
                >
                  <Lightbulb className="h-5 w-5" style={{ color: 'var(--secondary)' }} />
                </span>
                <div>
                  <div className="kicker" style={{ color: 'var(--secondary)' }}>Layer 06</div>
                  <div className="text-foreground font-semibold">决策层</div>
                </div>
              </div>
              <div className="flex-1 flex flex-wrap gap-2">
                {['智能体', '推荐引擎', '预测引擎', '自动驾驶'].map((c) => (
                  <span key={c} className="chip chip-cyan chip-mono">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Roadmap */}
      <Section id="roadmap">
        <SectionHead
          kicker="Roadmap"
          kickerColor="primary"
          title="三期实施 · 渐进式数智化演进"
          desc="从看得见数据，到用得上智能，再到能闭环决策。十二个月内分三阶段落地，每阶段都有可验证的交付物与指标。"
        />
        <div className="relative grid md:grid-cols-3 gap-6 pt-2">
          <div
            className="hidden md:block absolute h-px"
            style={{
              top: '19px',
              left: '8%',
              right: '8%',
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
              opacity: 0.6,
            }}
          />
          {ROADMAP.map((p) => (
            <div key={p.phase} className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-3.5 h-3.5 rounded-full relative z-10"
                  style={{
                    background: p.accent === 'primary' ? 'var(--primary)' : p.accent === 'secondary' ? 'var(--secondary)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: '2px solid var(--background)',
                  }}
                />
                <div>
                  <div className="kicker" style={{ color: p.accent === 'primary' ? 'var(--primary)' : p.accent === 'secondary' ? 'var(--secondary)' : 'var(--muted-foreground)' }}>
                    {p.phase}
                  </div>
                  <div className="mono text-sm text-foreground font-semibold">{p.duration}</div>
                </div>
              </div>
              <div
                className="rounded-lg p-6"
                style={{
                  background: 'var(--card)',
                  border: `1px solid ${p.accent === 'secondary' ? 'color-mix(in srgb, var(--secondary) 35%, transparent)' : 'var(--border)'}`,
                }}
              >
                <div className="mb-3">
                  <span className={`chip chip-mono ${p.tagClass === 'red' ? 'chip-red' : p.tagClass === 'cyan' ? 'chip-cyan' : ''}`}>{p.tag}</span>
                </div>
                <h3 className="text-foreground font-semibold text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.desc}</p>
                <div className="space-y-2 mb-5">
                  {p.items.map((it) => (
                    <div key={it} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckIcon color={p.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)'} />
                      <span className="truncate">{it}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="kicker mb-1">关键指标</div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="mono text-2xl font-semibold"
                      style={{ color: p.accent === 'primary' ? 'var(--primary)' : 'var(--secondary)' }}
                    >
                      {p.metric}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{p.metricLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Trust + CTA */}
      <Section id="trust">
        <div className="max-w-4xl mx-auto mb-16 sm:mb-20">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <span className="h-px w-10" style={{ background: 'var(--secondary)' }} />
            <span className="kicker" style={{ color: 'var(--secondary)' }}>Trust</span>
            <span className="h-px w-10" style={{ background: 'var(--secondary)' }} />
          </div>
          <blockquote className="text-center">
            <Quote className="h-8 w-8 mx-auto mb-6" style={{ color: 'var(--primary)' }} />
            <p className="display-h text-foreground font-semibold text-2xl md:text-3xl leading-relaxed">
              数智绿茵让我们第一次真正做到了<span style={{ color: 'var(--primary)' }}>用数据说话</span>。从训练负荷到战术选择，每一个决定都有依据，每一个球员都看得见自己的成长。
            </p>
            <footer className="mt-7 flex items-center justify-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full mono text-sm text-foreground"
                style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
              >
                李
              </span>
              <div className="text-left">
                <div className="text-sm text-foreground font-medium">李指导</div>
                <div className="text-xs text-muted-foreground truncate">某中超俱乐部 · 技术总监</div>
              </div>
            </footer>
          </blockquote>
        </div>

        <div
          className="relative overflow-hidden rounded-lg"
          style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 28% 0%, color-mix(in srgb, var(--primary) 20%, transparent) 0%, color-mix(in srgb, var(--primary) 0%, transparent) 55%), radial-gradient(ellipse at 82% 100%, color-mix(in srgb, var(--secondary) 16%, transparent) 0%, color-mix(in srgb, var(--secondary) 0%, transparent) 55%)',
            }}
          />
          <div className="relative px-6 sm:px-8 md:px-14 py-12 md:py-16 text-center">
            <div className="flex items-center gap-3 mb-5 justify-center">
              <span className="kicker" style={{ color: 'var(--primary)' }}>Get Started</span>
              <span className="h-px w-10" style={{ background: 'var(--primary)' }} />
            </div>
            <h2 className="display-h text-foreground font-semibold text-3xl md:text-5xl max-w-3xl mx-auto">
              让数据为你的俱乐部赢得下一场
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed">
              预约一次专属演示，我们将根据你的俱乐部现状，定制三阶段演进路径与首批 AI 能力清单。
            </p>
            <div className="mt-8 sm:mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/app/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-medium bg-primary text-primary-foreground transition hover:opacity-90"
              >
                <CalendarCheck className="h-4 w-4" />预约演示
              </Link>
              <a
                href="#overview"
                className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-medium transition hover:opacity-90"
                style={{ background: 'var(--secondary)', color: 'var(--on-accent)' }}
              >
                <FileDown className="h-4 w-4" />获取方案
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" style={{ color: 'var(--secondary)' }} />私有化部署</span>
              <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" style={{ color: 'var(--secondary)' }} />数据本地存储</span>
              <span className="flex items-center gap-1.5"><Headphones className="h-3.5 w-3.5" style={{ color: 'var(--secondary)' }} />专属交付团队</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-md"
                  style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
                >
                  <Activity className="h-4 w-4" style={{ color: 'var(--on-accent)' }} />
                </span>
                <span className="font-display text-base font-semibold tracking-tight text-foreground">数智绿茵</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                面向现代足球俱乐部的数智化管理平台。三端协同 · 九大 AI 能力 · 六层技术架构，让数据学会思考。
              </p>
              <p className="mt-5 text-xs text-muted-foreground mono">© 2026 数智绿茵 · FOOTBALL OS</p>
            </div>
            <div className="md:col-span-4">
              <div className="kicker mb-4">快速链接</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {NAV_LINKS.map((l) => (
                  <a key={l.href} href={l.href} className="text-muted-foreground hover:text-[var(--foreground)] transition truncate">{l.label}</a>
                ))}
                <a href="#trust" className="text-muted-foreground hover:text-[var(--foreground)] transition truncate">预约演示</a>
              </div>
            </div>
            <div className="md:col-span-3">
              <div className="kicker mb-4">联系方式</div>
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" style={{ color: 'var(--secondary)' }} /><span className="mono truncate">contact@football-os.cn</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" style={{ color: 'var(--secondary)' }} /><span className="mono truncate">400-888-2026</span></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" style={{ color: 'var(--secondary)' }} /><span className="truncate">北京 · 上海</span></div>
              </div>
            </div>
          </div>
          <div className="mt-8 sm:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="truncate">本方案为客户提案展示，数据均为示意。</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[var(--foreground)] transition truncate">隐私政策</a>
              <a href="#" className="hover:text-[var(--foreground)] transition truncate">服务条款</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Section({ id, children, bg }: { id: string; children: React.ReactNode; bg?: string }) {
  return (
    <section id={id} className="px-0" style={{ background: bg, paddingTop: 'clamp(64px, 8vw, 96px)', paddingBottom: 'clamp(64px, 8vw, 96px)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  )
}

function SectionHead({ kicker, kickerColor, title, desc }: { kicker: string; kickerColor: 'primary' | 'secondary'; title: string; desc: string }) {
  return (
    <div className="max-w-3xl mb-10 sm:mb-14">
      <div className="flex items-center gap-3 mb-4">
        <span className="kicker" style={{ color: kickerColor === 'primary' ? 'var(--primary)' : 'var(--secondary)' }}>{kicker}</span>
        <span className="h-px w-10" style={{ background: kickerColor === 'primary' ? 'var(--primary)' : 'var(--secondary)' }} />
      </div>
      <h2 className="display-h text-foreground font-semibold text-3xl md:text-5xl">{title}</h2>
      <p className="mt-5 text-base text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/** Tactics preview block on landing page (vertical pitch layout). */
function TacticsPreview() {
  // 4-3-3 vertical pitch
  const players = [
    { no: 7, left: '30%', top: '14%', cls: 'fwd' },
    { no: 9, left: '50%', top: '10%', cls: 'fwd' },
    { no: 11, left: '70%', top: '14%', cls: 'fwd' },
    { no: 6, left: '32%', top: '38%', cls: 'mid' },
    { no: 8, left: '50%', top: '42%', cls: 'mid' },
    { no: 10, left: '68%', top: '38%', cls: 'mid' },
    { no: 2, left: '18%', top: '66%', cls: 'def' },
    { no: 3, left: '39%', top: '69%', cls: 'def' },
    { no: 4, left: '61%', top: '69%', cls: 'def' },
    { no: 5, left: '82%', top: '66%', cls: 'def' },
    { no: 1, left: '50%', top: '90%', cls: 'gk' },
  ]
  return (
    <div className="grid lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8">
        <div className="rounded-lg p-5" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" style={{ color: 'var(--secondary)' }} />
              <span className="text-sm text-foreground font-medium">阵型看板 · 4-3-3</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip chip-cyan chip-mono">LIVE</span>
              <span className="chip chip-mono">主场</span>
            </div>
          </div>
          <Pitch players={players} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
            <Legend color="var(--secondary)" label="门将" />
            <Legend color="var(--card)" border label="后卫" />
            <Legend color="var(--primary)" label="中场 / 前锋" />
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-5">
        <div className="rounded-lg p-5" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="kicker">阵型</span>
            <Layers className="h-4 w-4" style={{ color: 'var(--secondary)' }} />
          </div>
          <div className="mono text-3xl font-semibold text-foreground">4-3-3</div>
          <div className="text-xs text-muted-foreground mt-1 truncate">高位压迫 · 两翼齐飞</div>
          <div className="mt-4 pt-4 grid grid-cols-3 gap-2 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            <div><div className="mono text-sm text-foreground">4</div><div className="text-[10px] text-muted-foreground truncate">后卫</div></div>
            <div><div className="mono text-sm" style={{ color: 'var(--primary)' }}>3</div><div className="text-[10px] text-muted-foreground truncate">中场</div></div>
            <div><div className="mono text-sm" style={{ color: 'var(--secondary)' }}>3</div><div className="text-[10px] text-muted-foreground truncate">前锋</div></div>
          </div>
        </div>
        <div className="rounded-lg p-5" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="kicker">关键球员评分</span>
            <Star className="h-4 w-4" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="space-y-3">
            {[
              { no: 9, pos: '中锋', score: '8.6', color: 'var(--primary)' },
              { no: 10, pos: '前腰', score: '8.1', color: 'var(--foreground)' },
              { no: 8, pos: '中卫', score: '7.8', color: 'var(--foreground)' },
              { no: 7, pos: '右边锋', score: '7.4', color: 'var(--secondary)' },
            ].map((p) => (
              <div key={p.no} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="mono text-xs text-muted-foreground w-6 shrink-0">{p.no}</span>
                  <span className="text-sm text-foreground truncate">{p.pos}</span>
                </div>
                <span className="mono text-sm font-semibold" style={{ color: p.color }}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="rounded-lg p-5"
          style={{
            borderColor: 'color-mix(in srgb, var(--secondary) 35%, transparent)',
            borderWidth: 1,
            borderStyle: 'solid',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--secondary) 5%, transparent) 0%, color-mix(in srgb, var(--secondary) 0%, transparent) 100%)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="kicker" style={{ color: 'var(--secondary)' }}>AI 建议</span>
            <Sparkles className="h-4 w-4" style={{ color: 'var(--secondary)' }} />
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            建议 65 分钟用 11 号换下体能下降的 7 号，保持右路冲击力；中场 8 号回撤加强防守覆盖。
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="chip chip-cyan chip-mono">换人</span>
            <span className="chip chip-cyan chip-mono">阵型微调</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: color, border: border ? '1px solid var(--on-media)' : 'none' }}
      />
      <span className="truncate">{label}</span>
    </div>
  )
}

/** Vertical pitch used on landing page. */
export function Pitch({ players }: { players: { no: number; left: string; top: string; cls: string }[] }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-md"
      style={{
        aspectRatio: '16/10',
        background: 'linear-gradient(135deg, var(--pitch-green-dark) 0%, var(--pitch-green-mid) 45%, var(--pitch-green-dark) 100%)',
        border: '1px solid color-mix(in srgb, var(--on-pitch) 18%, transparent)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, color-mix(in srgb, var(--on-pitch) 3.5%, transparent) 0, color-mix(in srgb, var(--on-pitch) 3.5%, transparent) 1px, transparent 1px, transparent 10%)',
        }}
      />
      {/* Pitch markings */}
      <div className="absolute" style={{ left: '50%', top: 0, bottom: 0, width: '1.5px', background: 'color-mix(in srgb, var(--on-pitch) 32%, transparent)' }} />
      <div className="absolute" style={{ left: 0, right: 0, top: 0, height: '1.5px', background: 'color-mix(in srgb, var(--on-pitch) 32%, transparent)' }} />
      <div className="absolute" style={{ left: 0, right: 0, bottom: 0, height: '1.5px', background: 'color-mix(in srgb, var(--on-pitch) 32%, transparent)' }} />
      <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: '1.5px', background: 'color-mix(in srgb, var(--on-pitch) 32%, transparent)' }} />
      <div className="absolute" style={{ left: 0, top: 0, bottom: 0, width: '1.5px', background: 'color-mix(in srgb, var(--on-pitch) 32%, transparent)' }} />
      <div className="absolute" style={{ right: 0, top: 0, bottom: 0, width: '1.5px', background: 'color-mix(in srgb, var(--on-pitch) 32%, transparent)' }} />
      <div
        className="absolute rounded-full"
        style={{ left: '50%', top: '50%', width: '116px', height: '116px', border: '1.5px solid color-mix(in srgb, var(--on-pitch) 35%, transparent)', transform: 'translate(-50%,-50%)' }}
      />
      <div className="absolute rounded-full" style={{ left: '50%', top: '50%', width: '6px', height: '6px', background: 'color-mix(in srgb, var(--on-pitch) 50%, transparent)', transform: 'translate(-50%,-50%)' }} />
      <div className="absolute" style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: '48%', height: '16%', border: '1.5px solid color-mix(in srgb, var(--on-pitch) 30%, transparent)', borderTop: 'none' }} />
      <div className="absolute" style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '48%', height: '16%', border: '1.5px solid color-mix(in srgb, var(--on-pitch) 30%, transparent)', borderBottom: 'none' }} />
      <div className="absolute" style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: '24%', height: '7%', border: '1.5px solid color-mix(in srgb, var(--on-pitch) 28%, transparent)', borderTop: 'none' }} />
      <div className="absolute" style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '24%', height: '7%', border: '1.5px solid color-mix(in srgb, var(--on-pitch) 28%, transparent)', borderBottom: 'none' }} />
      {players.map((p) => (
        <div
          key={p.no}
          className="absolute flex items-center justify-center mono font-semibold"
          style={{
            left: p.left,
            top: p.top,
            transform: 'translate(-50%,-50%)',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            fontSize: '12px',
            border: '1.5px solid color-mix(in srgb, var(--on-pitch-strong) 85%, transparent)',
            boxShadow: '0 0 0 3px color-mix(in srgb, var(--background) 25%, transparent)',
            background:
              p.cls === 'gk'
                ? 'color-mix(in srgb, var(--secondary) 92%, transparent)'
                : p.cls === 'def'
                  ? 'color-mix(in srgb, var(--card) 85%, transparent)'
                  : p.cls === 'mid'
                    ? 'color-mix(in srgb, var(--primary) 82%, transparent)'
                    : 'color-mix(in srgb, var(--foreground) 92%, transparent)',
            color: p.cls === 'def' || p.cls === 'mid' ? 'var(--on-media)' : p.cls === 'gk' ? 'var(--background)' : 'var(--background)',
          }}
        >
          {p.no}
        </div>
      ))}
    </div>
  )
}
