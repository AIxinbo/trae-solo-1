'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useChapterStore } from '@/lib/stores/chapter-store';
import { useToast } from '@/components/ui/Toast';
import { Plus, PenLine, Trash2, Eye } from 'lucide-react';

export default function ChaptersListPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { chapters, fetchChapters, createChapter, deleteChapter } = useChapterStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [wordCountTarget, setWordCountTarget] = useState(2000);

  useEffect(() => { fetchChapters(id); }, [id, fetchChapters]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const chapter = await createChapter(id, { title, word_count_target: wordCountTarget });
    setShowModal(false);
    setTitle('');
    router.push(`/books/${id}/chapters/${chapter.id}`);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">章节列表</h1>
          <Button onClick={() => setShowModal(true)}><Plus size={18} /> 新建章节</Button>
        </div>

        <Modal open={showModal} onClose={() => setShowModal(false)} title="新建章节">
          <div className="space-y-4">
            <Input label="章节标题" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：第一章 穿越异世界" />
            <Input label="目标字数" type="number" value={wordCountTarget} onChange={(e) => setWordCountTarget(Number(e.target.value))} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowModal(false)}>取消</Button>
              <Button onClick={handleCreate}>创建并开始写作</Button>
            </div>
          </div>
        </Modal>

        {chapters.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <PenLine size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
              <p className="text-[var(--color-text-secondary)]">暂无章节，点击上方按钮创建第一章</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-[var(--color-border)]">
              {chapters.map((ch) => (
                <div key={ch.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-xs text-[var(--color-text-placeholder)] w-12 shrink-0">第{ch.sort_order}章</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/books/${id}/chapters/${ch.id}`} className="font-medium text-sm hover:text-[var(--color-primary)] transition-colors">
                      {ch.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--color-text-secondary)]">{ch.word_count?.toLocaleString() || 0} / {ch.word_count_target.toLocaleString()}字</span>
                      <Badge variant={ch.status === 'completed' ? 'success' : ch.status === 'draft' ? 'default' : 'info'}>
                        {ch.status === 'completed' ? '已完成' : ch.status === 'draft' ? '草稿' : '写作中'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/books/${id}/chapters/${ch.id}`}
                      className="p-2 rounded-lg hover:bg-[var(--color-primary-light)] text-[var(--color-primary)] transition-colors">
                      <PenLine size={16} />
                    </Link>
                    {ch.status === 'completed' && (
                      <Link href={`/books/${id}/chapters/${ch.id}/review`}
                        className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
                        <Eye size={16} />
                      </Link>
                    )}
                    <button onClick={() => { if (confirm('确定删除？')) { deleteChapter(ch.id); showToast('success', '已删除'); } }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}