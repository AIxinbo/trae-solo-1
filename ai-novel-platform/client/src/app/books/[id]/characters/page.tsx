'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { charactersApi } from '@/lib/api/characters';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import type { Character } from '@/types';

const defaultForm = {
  name: '', age: '', gender: '男', role_type: '主角',
  appearance: '', personality: '', background: '', motivation: '',
  speech_style: '', formality_level: 3, avg_sentence_len: 15,
  favorite_words: [] as string[], forbidden_words: [] as string[], tone_words: [] as string[],
};

export default function CharactersPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => {
    setLoading(true);
    setCharacters(await charactersApi.list(id));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, [id]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await charactersApi.update(editing.id, form);
      showToast('success', '角色已更新');
    } else {
      await charactersApi.create(id, form);
      showToast('success', '角色已创建');
    }
    setShowModal(false);
    setEditing(null);
    setForm(defaultForm);
    fetchData();
  };

  const openEdit = (c: Character) => {
    setEditing(c);
    setForm({
      name: c.name, age: c.age, gender: c.gender, role_type: c.role_type,
      appearance: c.appearance, personality: c.personality, background: c.background,
      motivation: c.motivation, speech_style: c.speech_style,
      formality_level: c.formality_level, avg_sentence_len: c.avg_sentence_len,
      favorite_words: c.favorite_words, forbidden_words: c.forbidden_words, tone_words: c.tone_words,
    });
    setShowModal(true);
  };

  const roleColors: Record<string, 'info' | 'default' | 'danger' | 'success' | 'warning'> = { '主角': 'info', '配角': 'default', '反派': 'danger', '路人': 'default' };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">角色管理</h1>
          <Button onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}>
            <Plus size={18} /> 添加角色
          </Button>
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? '编辑角色' : '添加角色'} className="max-w-2xl">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-3">
              <Input label="姓名" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="年龄" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              <select className="h-10 px-3 rounded-lg border border-[var(--color-border)] text-sm bg-white" value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="男">男</option><option value="女">女</option><option value="其他">其他</option>
              </select>
            </div>
            <select className="h-10 px-3 rounded-lg border border-[var(--color-border)] text-sm bg-white w-full" value={form.role_type}
              onChange={(e) => setForm({ ...form, role_type: e.target.value })}>
              <option value="主角">主角</option><option value="配角">配角</option><option value="反派">反派</option><option value="路人">路人</option>
            </select>
            <Textarea label="外貌描述" value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} />
            <Textarea label="性格特征" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} />
            <Textarea label="背景故事" value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} />
            <Textarea label="动机目标" value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} />
            <Textarea label="说话风格" value={form.speech_style} onChange={(e) => setForm({ ...form, speech_style: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
              <Button onClick={handleSubmit}>{editing ? '更新' : '创建'}</Button>
            </div>
          </div>
        </Modal>

        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div>
        ) : characters.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
              <p className="text-[var(--color-text-secondary)]">暂无角色，点击上方按钮创建</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {characters.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-sm font-medium text-[var(--color-primary)]">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{c.age}岁 · {c.gender}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                    <button onClick={async () => { await charactersApi.delete(c.id); fetchData(); showToast('success', '已删除'); }}
                      className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={roleColors[c.role_type] || 'default'}>{c.role_type}</Badge>
                </div>
                {c.personality && <p className="mt-2 text-xs text-[var(--color-text-secondary)] line-clamp-2">{c.personality}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}