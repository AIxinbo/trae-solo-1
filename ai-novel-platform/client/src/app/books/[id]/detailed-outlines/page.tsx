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
import { detailedOutlinesApi } from '@/lib/api/detailed-outlines';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { DetailedOutline } from '@/types';

const defaultForm = {
  chapter_id: '', scene_index: 1, title: '', function: '', emotion: '平',
  word_count_target: 500, characters: [] as string[], location: '',
  day_number: 1, description: '', key_dialogues: '', pleasure_types: [] as string[],
};

export default function DetailedOutlinesPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [items, setItems] = useState<DetailedOutline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DetailedOutline | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => {
    setLoading(true);
    setItems(await detailedOutlinesApi.list(id));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, [id]);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (editing) {
      await detailedOutlinesApi.update(editing.id, form);
      showToast('success', '细纲已更新');
    } else {
      await detailedOutlinesApi.create(id, form);
      showToast('success', '细纲已创建');
    }
    setShowModal(false);
    setEditing(null);
    setForm(defaultForm);
    fetchData();
  };

  const openEdit = (d: DetailedOutline) => {
    setEditing(d);
    setForm({ chapter_id: d.chapter_id, scene_index: d.scene_index, title: d.title, function: d.function, emotion: d.emotion, word_count_target: d.word_count_target, characters: d.characters, location: d.location, day_number: d.day_number, description: d.description, key_dialogues: d.key_dialogues, pleasure_types: d.pleasure_types });
    setShowModal(true);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">细纲管理</h1>
          <Button onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}><Plus size={18} /> 添加场景</Button>
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? '编辑场景' : '添加场景'} className="max-w-2xl">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Input label="场景标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="场景序号" type="number" value={form.scene_index} onChange={(e) => setForm({ ...form, scene_index: Number(e.target.value) })} />
              <Input label="目标字数" type="number" value={form.word_count_target} onChange={(e) => setForm({ ...form, word_count_target: Number(e.target.value) })} />
              <Input label="天数" type="number" value={form.day_number} onChange={(e) => setForm({ ...form, day_number: Number(e.target.value) })} />
            </div>
            <Input label="场景功能" value={form.function} onChange={(e) => setForm({ ...form, function: e.target.value })} placeholder="如：铺垫、转折、高潮" />
            <Input label="情感基调" value={form.emotion} onChange={(e) => setForm({ ...form, emotion: e.target.value })} />
            <Input label="地点" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Textarea label="场景描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea label="关键对话" value={form.key_dialogues} onChange={(e) => setForm({ ...form, key_dialogues: e.target.value })} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
              <Button onClick={handleSubmit}>{editing ? '更新' : '创建'}</Button>
            </div>
          </div>
        </Modal>

        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div>
        ) : items.length === 0 ? (
          <Card><div className="text-center py-12 text-[var(--color-text-secondary)]">暂无细纲，点击上方按钮添加场景</div></Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[var(--color-primary)]">#{item.scene_index}</span>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info">{item.emotion}</Badge>
                        {item.function && <Badge>{item.function}</Badge>}
                        <span className="text-xs text-[var(--color-text-secondary)]">第{item.day_number}天 · {item.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="p-1 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                    <button onClick={async () => { await detailedOutlinesApi.delete(item.id); fetchData(); showToast('success', '已删除'); }}
                      className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                {item.description && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{item.description}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}