import { useEffect, useState } from 'react'
import { Building2, MapPin, Pencil, Plus, Shield, Trash2, Trophy, Users, X } from 'lucide-react'
import AppShell from '../components/AppShell'
import { teamApi, type Team } from '../api'

interface EditState {
  open: boolean
  team?: Team
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [edit, setEdit] = useState<EditState>({ open: false })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const list = await teamApi.list()
      setTeams(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该球队？')) return
    try {
      await teamApi.remove(id)
      setTeams((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}>
            球队管理
          </h2>
          <p className="text-sm mt-1 truncate" style={{ color: 'var(--muted-foreground)' }}>
            管理俱乐部所属球队信息
          </p>
        </div>
        <button
          onClick={() => setEdit({ open: true })}
          className="h-9 px-4 rounded-full text-sm flex items-center gap-2 whitespace-nowrap transition hover:brightness-110"
          style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
        >
          <Plus className="w-4 h-4" />
          <span>新建球队</span>
        </button>
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-md text-sm mb-4"
          style={{
            background: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--destructive) 30%, transparent)',
            color: 'var(--destructive)',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
          />
        </div>
      ) : teams.length === 0 ? (
        <div
          className="rounded-lg p-12 flex flex-col items-center gap-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Shield className="w-10 h-10" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            暂无球队，点击右上角新建
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <div
              key={t.id}
              className="rounded-lg p-5 flex flex-col gap-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      background:
                        t.logo ? `url(${t.logo}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    }}
                  >
                    {!t.logo && <Trophy className="w-5 h-5" style={{ color: 'var(--on-accent)' }} />}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-base font-semibold truncate"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--foreground)' }}
                    >
                      {t.name}
                    </div>
                    {t.shortName && (
                      <div className="text-xs mt-0.5 truncate mono" style={{ color: 'var(--muted-foreground)' }}>
                        {t.shortName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setEdit({ open: true, team: t })}
                    className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--card-elevated)]"
                    style={{ color: 'var(--muted-foreground)' }}
                    aria-label="编辑"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--card-elevated)]"
                    style={{ color: 'var(--muted-foreground)' }}
                    aria-label="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {t.coach && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                    <span style={{ color: 'var(--foreground)' }}>{t.coach}</span>
                  </div>
                )}
                {t.homeVenue && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="truncate" style={{ color: 'var(--foreground)' }}>{t.homeVenue}</span>
                  </div>
                )}
                {t.foundedYear && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="mono" style={{ color: 'var(--foreground)' }}>成立于 {t.foundedYear}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {edit.open && (
        <TeamEditDialog
          team={edit.team}
          onClose={() => setEdit({ open: false })}
          onSaved={() => {
            setEdit({ open: false })
            load()
          }}
        />
      )}
    </AppShell>
  )
}

function TeamEditDialog({
  team,
  onClose,
  onSaved,
}: {
  team?: Team
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Partial<Team>>(
    team || { name: '', shortName: '', coach: '', homeVenue: '', foundedYear: undefined, logo: '' }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.name?.trim()) {
      setError('球队名称不能为空')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (team) {
        await teamApi.update(team.id, form)
      } else {
        await teamApi.create(form)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-lg p-6 flex flex-col gap-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
            {team ? '编辑球队' : '新建球队'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div
            className="px-3 py-2 rounded-md text-xs"
            style={{
              background: 'color-mix(in srgb, var(--destructive) 12%, transparent)',
              color: 'var(--destructive)',
            }}
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Field label="球队名称 *">
            <input
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10 px-3 rounded-md text-sm w-full"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </Field>
          <Field label="简称">
            <input
              value={form.shortName || ''}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              className="h-10 px-3 rounded-md text-sm w-full"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </Field>
          <Field label="主教练">
            <input
              value={form.coach || ''}
              onChange={(e) => setForm({ ...form, coach: e.target.value })}
              className="h-10 px-3 rounded-md text-sm w-full"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </Field>
          <Field label="主场">
            <input
              value={form.homeVenue || ''}
              onChange={(e) => setForm({ ...form, homeVenue: e.target.value })}
              className="h-10 px-3 rounded-md text-sm w-full"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </Field>
          <Field label="成立年份">
            <input
              type="number"
              value={form.foundedYear ?? ''}
              onChange={(e) => setForm({ ...form, foundedYear: e.target.value ? Number(e.target.value) : undefined })}
              className="h-10 px-3 rounded-md text-sm w-full mono"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </Field>
          <Field label="Logo URL">
            <input
              value={form.logo || ''}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="https://…"
              className="h-10 px-3 rounded-md text-sm w-full"
              style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-md text-sm transition-colors hover:bg-[var(--card-elevated)]"
            style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-md text-sm font-medium transition hover:brightness-110 disabled:opacity-60"
            style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
