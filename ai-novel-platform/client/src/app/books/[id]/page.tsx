'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useBookStore } from '@/lib/stores/book-store';
import { useChapterStore } from '@/lib/stores/chapter-store';
import { writingLogsApi } from '@/lib/api/writing-logs';
import { GitBranch, FileText, Users, PenLine, BarChart3, Clock, ArrowRight, Plus } from 'lucide-react';
import type { WritingLog } from '@/types';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentBook, fetchBook, loading } = useBookStore();
  const { chapters, fetchChapters } = useChapterStore();
  const [logs, setLogs] = useState<WritingLog[]>([]);

  useEffect(() => {
    if (id) { fetchBook(id); fetchChapters(id); writingLogsApi.list(id, 8).then(setLogs).catch(() => {}); }
  }, [id, fetchBook, fetchChapters]);

  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      create_book: '创建作品', create_outline: '创建大纲', create_character: '创建角色',
      create_chapter: '创建章节', update_chapter: '更新章节', create_timeline: '添加时间线',
    };
    return map[action] || action;
  };

  if (loading || !currentBook) {
    return <MainLayout><div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div></MainLayout>;
  }

  const completedChapters = chapters.filter((c) => c.status === 'completed').length;
  const totalWords = chapters.reduce((sum, c) => sum + (c.word_count || 0), 0);

  const quickLinks = [
    { href: `/books/${id}/outlines`, label: '大纲管理', icon: GitBranch, desc: '设计故事结构' },
    { href: `/books/${id}/detailed-outlines`, label: '细纲管理', icon: FileText, desc: '场景级详细规划' },
    { href: `/books/${id}/characters`, label: '角色管理', icon: Users, desc: '创建和管理角色' },
    { href: `/books/${id}/chapters`, label: '章节列表', icon: PenLine, desc: '开始写作' },
    { href: `/books/${id}/analysis`, label: '拆书分析', icon: BarChart3, desc: 'AI 分析参考作品' },
    { href: `/books/${id}/timeline`, label: '时间线', icon: Clock, desc: '故事时间线管理' },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 作品信息 */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{currentBook.title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-secondary)]">
                <Badge variant={currentBook.status === 'writing' ? 'info' : 'default'}>
                  {currentBook.status === 'draft' ? '草稿' : currentBook.status === 'writing' ? '连载中' : '已完结'}
                </Badge>
                <span>{currentBook.genre}</span>
                <span>·</span>
                <span>{totalWords.toLocaleString()} / {currentBook.word_count_target.toLocaleString()} 字</span>
              </div>
              {currentBook.synopsis && (
                <p className="mt-3 text-sm text-[var(--color-text-secondary)] line-clamp-2">{currentBook.synopsis}</p>
              )}
            </div>
            <Button onClick={() => router.push(`/books/${id}/chapters`)}>
              <PenLine size={18} /> 继续写作
            </Button>
          </div>
          <div className="mt-4">
            <Progress value={totalWords} max={currentBook.word_count_target || 1} showLabel size="md" />
          </div>
        </Card>

        {/* 快速入口 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}
                className="p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{link.label}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{link.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 章节进度 + 写作日志 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>章节进度</CardTitle>
              <span className="text-sm text-[var(--color-text-secondary)]">{completedChapters}/{chapters.length} 章完成</span>
            </CardHeader>
            {chapters.length === 0 ? (
              <div className="text-center py-6 text-sm text-[var(--color-text-secondary)]">
                暂无章节，<Link href={`/books/${id}/chapters`} className="text-[var(--color-primary)] hover:underline">创建第一章</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.slice(0, 5).map((ch) => (
                  <Link key={ch.id} href={`/books/${id}/chapters/${ch.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-[var(--color-text-placeholder)] w-8 shrink-0">第{ch.sort_order}章</span>
                      <span className="text-sm font-medium truncate">{ch.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[var(--color-text-secondary)]">{ch.word_count?.toLocaleString() || 0}字</span>
                      <Badge variant={ch.status === 'completed' ? 'success' : 'default'}>{ch.status === 'completed' ? '已完成' : '草稿'}</Badge>
                    </div>
                  </Link>
                ))}
                {chapters.length > 5 && (
                  <Link href={`/books/${id}/chapters`} className="block text-center text-sm text-[var(--color-primary)] hover:underline py-2">
                    查看全部 {chapters.length} 章
                  </Link>
                )}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>写作日志</CardTitle>
              <Link href={`/books/${id}/writing-logs`} className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
                全部 <ArrowRight size={14} />
              </Link>
            </CardHeader>
            {logs.length === 0 ? (
              <div className="text-center py-6 text-sm text-[var(--color-text-secondary)]">暂无日志</div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center gap-2 p-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                    <span className="text-[var(--color-text-secondary)]">{log.description}</span>
                    <span className="text-xs text-[var(--color-text-placeholder)] ml-auto shrink-0">
                      {new Date(log.created_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}