'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { writingLogsApi } from '@/lib/api/writing-logs';
import type { WritingLog } from '@/types';
import { FileText, Clock } from 'lucide-react';

const actionLabels: Record<string, string> = {
  create_book: '创建作品', create_outline: '创建大纲', create_character: '创建角色',
  create_chapter: '创建章节', update_chapter: '更新章节', create_timeline: '添加时间线',
  create_review: '提交审查',
};

export default function WritingLogsPage() {
  const { id } = useParams<{ id: string }>();
  const [logs, setLogs] = useState<WritingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    writingLogsApi.list(id, 100).then((data) => { setLogs(data); setLoading(false); });
  }, [id]);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">写作日志</h1>

        <Card>
          {loading ? (
            <div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
              <p className="text-[var(--color-text-secondary)]">暂无日志记录</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[var(--color-border)]" />
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-12">
                    <div className="absolute left-[14px] w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-white" />
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[var(--color-text-placeholder)]" />
                      <span className="text-xs text-[var(--color-text-placeholder)]">
                        {new Date(log.created_at).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{log.description}</p>
                    <Badge variant="info" className="mt-1">{actionLabels[log.action] || log.action}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}