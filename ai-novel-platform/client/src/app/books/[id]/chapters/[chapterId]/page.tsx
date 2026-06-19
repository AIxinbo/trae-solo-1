'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useChapterStore } from '@/lib/stores/chapter-store';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';

export default function ChapterWritePage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { currentChapter, fetchChapter, updateChapter } = useChapterStore();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchChapter(chapterId); }, [chapterId, fetchChapter]);

  useEffect(() => {
    if (currentChapter?.content) setContent(currentChapter.content);
  }, [currentChapter?.content]);

  const handleSave = async () => {
    setSaving(true);
    await updateChapter(chapterId, {
      content,
      word_count: content.length,
      status: content.length > 0 ? 'writing' : 'draft',
    });
    showToast('success', '已保存');
    setSaving(false);
  };

  const handleGenerate = async () => {
    showToast('info', 'AI 生成功能将在 Step 4 实现');
  };

  if (!currentChapter) {
    return <MainLayout><div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div></MainLayout>;
  }

  const wordCount = content.length;
  const target = currentChapter.word_count_target || 2000;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/books/${id}/chapters`)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">{currentChapter.title}</h1>
            <Badge variant={currentChapter.status === 'completed' ? 'success' : 'default'}>
              {currentChapter.status === 'completed' ? '已完成' : '写作中'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleGenerate}>
              <Sparkles size={16} /> AI 生成
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save size={16} /> 保存
            </Button>
          </div>
        </div>

        {/* 字数进度 */}
        <Card padding>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-secondary)]">字数进度</span>
            <span className="text-sm font-medium">{wordCount.toLocaleString()} / {target.toLocaleString()}字</span>
          </div>
          <Progress value={wordCount} max={target} showLabel size="sm" />
        </Card>

        {/* 编辑器 */}
        <Card padding className="flex-1">
          <Textarea
            className="min-h-[60vh] text-base leading-relaxed font-serif"
            placeholder="开始写作你的故事..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Card>

        {/* 底部操作 */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push(`/books/${id}/chapters/${chapterId}/review`)}>
            查看审查结果
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave}>保存草稿</Button>
            <Button onClick={async () => {
              await updateChapter(chapterId, { content, word_count: content.length, status: 'completed' });
              showToast('success', '章节已完成！');
              router.push(`/books/${id}/chapters/${chapterId}/review`);
            }}>
              完成并审查
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}