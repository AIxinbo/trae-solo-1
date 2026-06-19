'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useChapterStore } from '@/lib/stores/chapter-store';
import { useToast } from '@/components/ui/Toast';
import { generateApi } from '@/lib/api/generate';
import { ArrowLeft, Save, Sparkles, Loader2 } from 'lucide-react';

export default function ChapterWritePage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { currentChapter, fetchChapter, updateChapter } = useChapterStore();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  // AI 生成状态
  const [generating, setGenerating] = useState(false);
  const [genStage, setGenStage] = useState('');
  const [showGenModal, setShowGenModal] = useState(false);
  const [genWordTarget, setGenWordTarget] = useState(2000);

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
    setGenerating(true);
    setGenStage('正在规划章节结构...');
    setShowGenModal(true);

    try {
      const res = await generateApi.chapter(
        id,
        chapterId,
        genWordTarget || currentChapter?.word_count_target || 2000
      );

      if (res.success && res.data?.content) {
        setContent(res.data.content);
        setGenStage('生成完成！');
        showToast('success', `AI 生成完成，共 ${res.data.word_count?.toLocaleString() || 0} 字`);

        // 自动保存
        await updateChapter(chapterId, {
          content: res.data.content,
          word_count: res.data.word_count || 0,
          status: 'writing',
        });
      } else {
        showToast('error', res.message || '生成失败');
        setGenStage('生成失败');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'AI 生成失败，请检查模型配置';
      showToast('error', msg);
      setGenStage('生成失败');
    } finally {
      setGenerating(false);
      setShowGenModal(false);
    }
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
            <Button variant="outline" onClick={() => setShowGenModal(true)} disabled={generating}>
              <Sparkles size={16} /> AI 生成
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save size={16} /> 保存
            </Button>
          </div>
        </div>

        {/* AI 生成配置弹窗 */}
        <Modal open={showGenModal} onClose={() => !generating && setShowGenModal(false)} title="AI 生成章节">
          <div className="space-y-4">
            {generating ? (
              <div className="text-center py-8">
                <Loader2 size={36} className="mx-auto animate-spin text-[var(--color-primary)] mb-4" />
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{genStage}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  多智能体管线：Planner → Writer → DeAI → Proofreader
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  AI 将根据大纲、前文摘要、角色设定和细纲，自动生成本章正文。
                  生成过程包含规划、写作、去AI味、校对四个阶段。
                </p>
                <Input
                  label="目标字数"
                  type="number"
                  value={genWordTarget}
                  onChange={(e) => setGenWordTarget(Number(e.target.value))}
                />
                {content && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
                    当前已有 {wordCount.toLocaleString()} 字内容，AI 生成将覆盖现有内容。
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setShowGenModal(false)}>取消</Button>
                  <Button onClick={handleGenerate}>
                    <Sparkles size={16} /> 开始生成
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>

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
            placeholder="开始写作你的故事，或点击「AI 生成」让 AI 帮你创作..."
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