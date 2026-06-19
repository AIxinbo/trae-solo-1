'use client';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">拆书分析</h1>
          <Button disabled><Sparkles size={16} /> AI 分析（Step 6 实现）</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>参考作品分析</CardTitle></CardHeader>
          <div className="text-center py-12">
            <Sparkles size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
            <p className="text-[var(--color-text-secondary)]">拆书分析功能将在 Step 6 中实现</p>
            <p className="text-xs text-[var(--color-text-placeholder)] mt-1">支持上传参考作品，AI 自动提取大纲、角色、爽点等要素</p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}