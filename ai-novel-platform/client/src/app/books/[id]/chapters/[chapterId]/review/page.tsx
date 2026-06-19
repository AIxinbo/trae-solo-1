'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useChapterStore } from '@/lib/stores/chapter-store';
import { reviewApi } from '@/lib/api/review';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { ReviewResult } from '@/types';

const dimLabels: Record<string, string> = {
  story_logic: '故事逻辑', plot_pace: '情节节奏', conflict_setup: '冲突设置',
  character_consistency: '角色一致性', character_growth: '角色成长', dialogue_quality: '对话质量',
  language_fluency: '语言流畅度', scene_description: '场景描写', emotion_rendering: '情感渲染',
  deai_score: '去AI味', originality: '原创性', timeline_consistency: '时间线一致性',
};

export default function ChapterReviewPage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { currentChapter, fetchChapter } = useChapterStore();
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchChapter(chapterId); }, [chapterId, fetchChapter]);

  const handleReview = async () => {
    setLoading(true);
    try {
      const result = await reviewApi.reviewChapter(id, chapterId);
      setReview(result);
    } catch {
      showToast('error', '审查失败，请稍后重试');
    }
    setLoading(false);
  };

  const scoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  if (!currentChapter) {
    return <MainLayout><div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/books/${id}/chapters/${chapterId}`)}
              className="p-1 rounded-lg hover:bg-gray-100">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">审查：{currentChapter.title}</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">{currentChapter.word_count?.toLocaleString() || 0}字</p>
            </div>
          </div>
          <Button onClick={handleReview} loading={loading}>
            <RotateCcw size={16} /> {review ? '重新审查' : '开始审查'}
          </Button>
        </div>

        {review ? (
          <>
            {/* 总分 */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">综合评分</p>
                  <p className={`text-4xl font-bold ${scoreColor(review.overall_score)}`}>
                    {review.overall_score.toFixed(0)}
                  </p>
                  <Badge variant={review.passed ? 'success' : 'warning'} className="mt-1">
                    {review.passed ? '通过' : review.rewrite_required ? '需要修改' : '建议优化'}
                  </Badge>
                </div>
                <Progress value={review.overall_score} max={100} className="w-40" size="md" showLabel />
              </div>
            </Card>

            {/* 各维度评分 */}
            <Card>
              <CardHeader><CardTitle>维度评分详情</CardTitle></CardHeader>
              <div className="space-y-4">
                {Object.entries(review.dimensions).map(([key, dim]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{dimLabels[key] || key}</span>
                      <span className={`text-sm font-bold ${scoreColor(dim.score)}`}>{dim.score.toFixed(0)}</span>
                    </div>
                    <Progress value={dim.score} max={100} size="sm" />
                    {dim.suggestions && (
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{dim.suggestions}</p>
                    )}
                    {dim.issues && dim.issues.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {(dim.issues as Array<{ severity: string; description: string }>).map((issue, i) => (
                          <li key={i} className="text-xs flex items-center gap-1">
                            <Badge variant={issue.severity === 'high' ? 'danger' : issue.severity === 'medium' ? 'warning' : 'info'}>
                              {issue.severity === 'high' ? '严重' : issue.severity === 'medium' ? '中等' : '轻微'}
                            </Badge>
                            <span className="text-[var(--color-text-secondary)]">{issue.description}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* 优先问题 */}
            {review.priority_issues && review.priority_issues.length > 0 && (
              <Card>
                <CardHeader><CardTitle>优先处理</CardTitle></CardHeader>
                <ul className="space-y-2">
                  {(review.priority_issues as Array<{ description: string; suggestion: string }>).map((issue, i) => (
                    <li key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-sm font-medium text-red-700">{issue.description}</p>
                      <p className="text-xs text-red-600 mt-1">{issue.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="flex gap-2">
              <Button onClick={() => router.push(`/books/${id}/chapters/${chapterId}`)}>返回编辑</Button>
              <Button variant="outline" onClick={() => router.push(`/books/${id}/chapters`)}>章节列表</Button>
            </div>
          </>
        ) : (
          <Card>
            <div className="text-center py-16">
              <p className="text-[var(--color-text-secondary)] mb-4">点击「开始审查」对本章进行 AI 质量评估</p>
              <Button onClick={handleReview} loading={loading}>开始审查</Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}