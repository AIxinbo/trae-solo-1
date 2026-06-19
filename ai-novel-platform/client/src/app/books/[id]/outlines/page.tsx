'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useOutlineStore } from '@/lib/stores/outline-store';
import { useToast } from '@/components/ui/Toast';
import { generateApi } from '@/lib/api/generate';
import { Plus, ChevronRight, ChevronDown, GripVertical, Trash2, Pencil, Sparkles } from 'lucide-react';
import type { OutlineNode } from '@/types';

function OutlineTree({ nodes, level = 0, onEdit, onDelete }: {
  nodes: OutlineNode[];
  level?: number;
  onEdit: (node: OutlineNode) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id} style={{ marginLeft: level * 16 }}>
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group">
            {node.children && node.children.length > 0 ? (
              <button onClick={() => toggle(node.id)} className="p-0.5">
                {expanded[node.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <GripVertical size={14} className="text-[var(--color-text-placeholder)] cursor-grab" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">{node.title}</span>
              {node.content && <span className="text-xs text-[var(--color-text-secondary)] ml-2 truncate">— {node.content.slice(0, 40)}</span>}
            </div>
            <Badge variant="info">{node.level === 'volume' ? '卷' : node.level === 'chapter' ? '章' : '节'}</Badge>
            <span className="text-xs text-[var(--color-text-placeholder)]">{node.word_count_target}字</span>
            <div className="hidden group-hover:flex items-center gap-1">
              <button onClick={() => onEdit(node)} className="p-1 rounded hover:bg-gray-200"><Pencil size={14} /></button>
              <button onClick={() => onDelete(node.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
          {node.children && expanded[node.id] && (
            <OutlineTree nodes={node.children} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OutlinesPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { outlines, fetchOutlines, createOutline, updateOutline, deleteOutline } = useOutlineStore();
  const [showModal, setShowModal] = useState(false);
  const [editingNode, setEditingNode] = useState<OutlineNode | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [form, setForm] = useState({ title: '', level: 'chapter', content: '', word_count_target: 2000, parent_id: '' });

  useEffect(() => { if (id) fetchOutlines(id); }, [id, fetchOutlines]);

  const handleGenerateOutline = async () => {
    setGenLoading(true);
    try {
      const res = await generateApi.outline(id);
      if (res.success && res.data?.volumes) {
        // 将 AI 生成的大纲节点逐个创建
        for (const vol of res.data.volumes) {
          const volNode = await createOutline(id, {
            level: 'volume', title: vol.title, content: vol.summary || '', word_count_target: 0,
          });
          for (const ch of vol.chapters || []) {
            await createOutline(id, {
              parent_id: volNode.id, level: 'chapter', title: ch.title,
              content: ch.summary || '', word_count_target: ch.word_count_target || 2000,
            });
          }
        }
        showToast('success', `AI 生成了 ${res.data.volumes.length} 卷大纲`);
        fetchOutlines(id);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : '生成失败');
    }
    setGenLoading(false);
  };

  const buildTree = (nodes: OutlineNode[]): OutlineNode[] => {
    const map = new Map<string, OutlineNode>();
    const roots: OutlineNode[] = [];
    nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));
    nodes.forEach((n) => {
      const node = map.get(n.id)!;
      if (n.parent_id && map.has(n.parent_id)) {
        map.get(n.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (editingNode) {
      await updateOutline(editingNode.id, form);
      showToast('success', '大纲节点已更新');
    } else {
      await createOutline(id, { ...form, parent_id: form.parent_id || undefined });
      showToast('success', '大纲节点已创建');
    }
    setShowModal(false);
    setEditingNode(null);
    setForm({ title: '', level: 'chapter', content: '', word_count_target: 2000, parent_id: '' });
  };

  const openEdit = (node: OutlineNode) => {
    setEditingNode(node);
    setForm({ title: node.title, level: node.level, content: node.content || '', word_count_target: node.word_count_target, parent_id: node.parent_id || '' });
    setShowModal(true);
  };

  const tree = buildTree(outlines);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">大纲管理</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleGenerateOutline} loading={genLoading}>
              <Sparkles size={16} /> AI 生成大纲
            </Button>
            <Button onClick={() => { setEditingNode(null); setForm({ title: '', level: 'chapter', content: '', word_count_target: 2000, parent_id: '' }); setShowModal(true); }}>
            <Plus size={18} /> 添加节点
          </Button>
          </div>
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editingNode ? '编辑大纲节点' : '添加大纲节点'}>
          <div className="space-y-4">
            <Select label="层级" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
              options={[{ value: 'volume', label: '卷' }, { value: 'chapter', label: '章' }, { value: 'section', label: '节' }]} />
            <Input label="标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea label="内容概要" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <Input label="目标字数" type="number" value={form.word_count_target} onChange={(e) => setForm({ ...form, word_count_target: Number(e.target.value) })} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
              <Button onClick={handleSubmit}>{editingNode ? '更新' : '创建'}</Button>
            </div>
          </div>
        </Modal>

        <Card>
          {outlines.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-secondary)]">
              <p>暂无大纲，点击上方按钮开始设计故事结构</p>
            </div>
          ) : (
            <OutlineTree nodes={tree} onEdit={openEdit} onDelete={async (nodeId) => { await deleteOutline(nodeId); showToast('success', '已删除'); }} />
          )}
        </Card>
      </div>
    </MainLayout>
  );
}