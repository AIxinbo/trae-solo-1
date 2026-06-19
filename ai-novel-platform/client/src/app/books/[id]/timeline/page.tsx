'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { timelineApi, type TimelineEvent, type TimelineEventCreate } from '@/lib/api/timeline';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const defaultForm: TimelineEventCreate = {
  day_number: 1, event_desc: '', involved_chars: [], location: '', season: '', importance: 5,
};

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState<TimelineEventCreate>(defaultForm);

  const fetchData = async () => {
    setLoading(true);
    setEvents(await timelineApi.list(id));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, [id]);

  const handleSubmit = async () => {
    if (!form.event_desc.trim()) return;
    if (editing) {
      await timelineApi.update(editing.id, form);
      showToast('success', '时间线事件已更新');
    } else {
      await timelineApi.create(id, form);
      showToast('success', '时间线事件已创建');
    }
    setShowModal(false);
    setEditing(null);
    setForm(defaultForm);
    fetchData();
  };

  const openEdit = (e: TimelineEvent) => {
    setEditing(e);
    setForm({ day_number: e.day_number, event_desc: e.event_desc, involved_chars: e.involved_chars, location: e.location, season: e.season, importance: e.importance, chapter_id: e.chapter_id || undefined });
    setShowModal(true);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">时间线</h1>
          <Button onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}>
            <Plus size={18} /> 添加事件
          </Button>
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? '编辑事件' : '添加事件'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="天数" type="number" value={form.day_number} onChange={(e) => setForm({ ...form, day_number: Number(e.target.value) })} />
              <Input label="重要度(1-10)" type="number" value={form.importance} onChange={(e) => setForm({ ...form, importance: Number(e.target.value) })} />
            </div>
            <Input label="事件描述" value={form.event_desc} onChange={(e) => setForm({ ...form, event_desc: e.target.value })} />
            <Input label="地点" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input label="季节" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="如：春、夏、秋、冬" />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
              <Button onClick={handleSubmit}>{editing ? '更新' : '创建'}</Button>
            </div>
          </div>
        </Modal>

        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div>
        ) : events.length === 0 ? (
          <Card><div className="text-center py-12 text-[var(--color-text-secondary)]">暂无时间线事件，点击上方按钮添加</div></Card>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[var(--color-border)]" />
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="relative pl-14">
                  <div className="absolute left-[18px] w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-white" />
                  <Card className="hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--color-primary)]">第{event.day_number}天</span>
                        {event.season && <Badge variant="info">{event.season}</Badge>}
                        {event.location && <Badge>{event.location}</Badge>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(event)} className="p-1 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                        <button onClick={async () => { await timelineApi.delete(event.id); fetchData(); showToast('success', '已删除'); }}
                          className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{event.event_desc}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}