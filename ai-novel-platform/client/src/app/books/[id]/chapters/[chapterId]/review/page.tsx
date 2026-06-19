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
import { ArrowLeft, RotateCcw, Loader2, CheckCircle2 } from 'lucide-react';
import type { ReviewResult } from '@/types';

const dimLabels: Record<string, string> = {
  story_logic: '故事逻辑', plot_pace: '情节节奏', conflict_setup: '冲突设置',
  character_consistency: '角色一致性', character_growth: '角色成长', dialogue_quality: '对话质量',
  language_fluency: '语言流畅度', scene_description: '场景描写', emotion_rendering: '情感渲染',
  deai_score: '去AI味', originality: '原创性', timeline_consistency: '时间线一致性',
};

const dimGroups = [
  { name: '故事逻辑组（30%）', keys: ['story_logic', 'plot_pace', 'conflict_setup', 'timeline_consistency'], weight: 30 },
  { name: '角色组（18%）', keys: ['character_consistency', 'character_growth', 'dialogue_quality'], weight: 18 },
  { name: '写作质量组（26%）', keys: ['language_fluency', 'scene_description', 'emotion_rendering', 'originality'], weight: 26 },
  { name: '去AI味组（18%）', keys: ['deai_score'], weight: 18 },
];

const pipelineStages = [
  '正在审查故事逻辑与连贯性...',
  '正在审查角色塑造与对话...',
  '正在审查写作质量与去AI味...',
  '正在生成综合评分...',
];

export default function ChapterReviewPage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { currentChapter, fetchChapter } = useChapterStore();
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => { fetchChapter(chapterId); }, [chapterId, fetchChapter]);

  const handleReview = async () => {
    setLoading(true);
    setStageIndex(0);

    // 模拟管线阶段动画
    const timer = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, pipelineStages.length - 1));
    }, 1200);

    try {
      const result = await reviewApi.reviewChapter(id, chapterId);
      setReview(result);
      showToast('success', `审查完成：${result.overall_score}分`);
    } catch {
      showToast('error', '审查失败，请检查模型配置');
    } finally {
      clearInterval(timer);
      setLoading(false);
      setStageIndex(0);
    }
  };

  const scoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const scoreBg = (s: number) => {
    if (s >= 80) return 'bg-green-50 border-green-200';
    if (s >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
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

        {loading ? (
          <Card>
            <div className="text-center py-12">
              <Loader2 size={36} className="mx-auto animate-spin text-[var(--color-primary)] mb-6" />
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{pipelineStages[stageIndex]}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                多智能体审查管线：3个并行审查 Agent → 综合评分 Agent
              </p>
              <div className="flex justify-center gap-1 mt-4">
                {pipelineStages.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= stageIndex ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          </Card>
        ) : review ? (
          <>
            {/* 总分卡片 */}
            <Card className={scoreBg(review.overall_score)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">综合评分</p>
                  <p className={`text-5xl font-bold ${scoreColor(review.overall_score)}`}>
                    {review.overall_score}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={review.passed ? 'success' : 'warning'}>
                      {review.passed ? '通过' : review.rewrite_required ? '需要重写' : '建议优化'}
                    </Badge>
                    {review.rewrite_required && (
                      <Badge variant="danger">必须修改</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Progress value={review.overall_score} max={100} className="w-40" size="md" showLabel />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {review.overall_score >= 85 ? '优秀' : review.overall_score >= 70 ? '合格' : '需改进'}
                  </p>
                </div>
              </div>
            </Card>

            {/* 分组评分 */}
            {dimGroups.map((group) => {
              const groupDims = group.keys.filter((k) => review.dimensions[k]);
              if (groupDims.length === 0) return null;
              const avgScore = Math.round(
                groupDims.reduce((sum, k) => sum + (review.dimensions[k]?.score || 0), 0) / groupDims.length
              );
              return (
                <Card key={group.name}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <span className={`text-sm font-bold ${scoreColor(avgScore)}`}>{avgScore}分</span>
                  </CardHeader>
                  <div className="space-y-3">
                    {groupDims.map((key) => {
                      const dim = review.dimensions[key];
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{dimLabels[key] || key}</span>
                            <span className={`text-sm font-bold ${scoreColor(dim.score)}`}>{dim.score}</span>
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
                      );
                    })}
                  </div>
                </Card>
              );
            })}

            {/* 优先问题 */}
            {review.priority_issues && review.priority_issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>优先处理</CardTitle>
                  <Badge variant="danger">{review.priority_issues.length}个问题</Badge>
                </CardHeader>
                <ul className="space-y-2">
                  {(review.priority_issues as Array<{ severity: string; dimension: string; description: string; suggestion: string }>).map((issue, i) => (
                    <li key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger">{issue.severity === 'high' ? '严重' : '中等'}</Badge>
                        {issue.dimension && <span className="text-xs text-red-500">{dimLabels[issue.dimension] || issue.dimension}</span>}
                      </div>
                      <p className="text-sm font-medium text-red-700 mt-1">{issue.description}</p>
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {issue.suggestion}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pb-8">
              <Button onClick={() => router.push(`/books/${id}/chapters/${chapterId}`)}>返回编辑</Button>
              <Button variant="outline" onClick={() => router.push(`/books/${id}/chapters`)}>章节列表</Button>
              <Button variant="ghost" onClick={handleReview}>
                <RotateCcw size={14} /> 重新审查
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <div className="text-center py-16">
              <p className="text-[var(--color-text-secondary)] mb-2">对本章进行 AI 多维度质量评估</p>
              <p className="text-xs text-[var(--color-text-placeholder)] mb-6">
                3个并行审查 Agent + 综合评分 · 12维度 · 加权评分
              </p>
              <Button onClick={handleReview} loading={loading}>开始审查</Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}