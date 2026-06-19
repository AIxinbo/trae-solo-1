'use client';
import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { modelConfigApi } from '@/lib/api/model-config';
import { Plus, Pencil, Trash2, Cpu } from 'lucide-react';
import type { ModelConfig } from '@/types';

const defaultForm = { name: '', base_url: '', api_key: '', model_name: '', scenes: [] as string[] };

const sceneOptions = ['writing', 'review', 'analysis', 'deai', 'proofread'];

export default function ModelConfigPage() {
  const { showToast } = useToast();
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ModelConfig | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => { setLoading(true); setConfigs(await modelConfigApi.list()); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.base_url.trim() || !form.api_key.trim() || !form.model_name.trim()) return;
    if (editing) {
      await modelConfigApi.update(editing.id, form);
      showToast('success', '配置已更新');
    } else {
      await modelConfigApi.create(form);
      showToast('success', '模型已添加');
    }
    setShowModal(false);
    setEditing(null);
    setForm(defaultForm);
    fetchData();
  };

  const openEdit = (c: ModelConfig) => {
    setEditing(c);
    setForm({ name: c.name, base_url: c.base_url, api_key: '', model_name: c.model_name, scenes: c.scenes });
    setShowModal(true);
  };

  const toggleScene = (scene: string) => {
    setForm((prev) => ({
      ...prev,
      scenes: prev.scenes.includes(scene) ? prev.scenes.filter((s) => s !== scene) : [...prev.scenes, scene],
    }));
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">模型配置</h1>
          <Button onClick={() => { setEditing(null); setForm(defaultForm); setShowModal(true); }}><Plus size={18} /> 添加模型</Button>
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? '编辑模型' : '添加模型'}>
          <div className="space-y-4">
            <Input label="配置名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="如：我的DeepSeek" />
            <Input label="API 地址" value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://api.deepseek.com/v1" />
            <Input label="API Key" type="password" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder={editing ? '留空则不修改' : 'sk-...'} />
            <Input label="模型名称" value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="deepseek-chat" />
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">应用场景</p>
              <div className="flex flex-wrap gap-2">
                {sceneOptions.map((s) => (
                  <button key={s} onClick={() => toggleScene(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.scenes.includes(s) ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
              <Button onClick={handleSubmit}>{editing ? '更新' : '添加'}</Button>
            </div>
          </div>
        </Modal>

        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div>
        ) : configs.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Cpu size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
              <p className="text-[var(--color-text-secondary)]">暂无模型配置</p>
              <p className="text-xs text-[var(--color-text-placeholder)] mt-1">添加兼容 OpenAI API 的第三方模型</p>
              <Button onClick={() => { setForm(defaultForm); setShowModal(true); }} className="mt-4">添加模型</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {configs.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu size={18} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{c.model_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-gray-100"><Pencil size={14} /></button>
                    <button onClick={async () => { await modelConfigApi.delete(c.id); fetchData(); showToast('success', '已删除'); }}
                      className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.scenes.map((s) => <Badge key={s} variant="info">{s}</Badge>)}
                  <Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? '启用' : '禁用'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}