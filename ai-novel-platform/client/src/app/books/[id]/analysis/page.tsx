'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import { analysisApi, type AnalysisRecord } from '@/lib/api/analysis';
import { Sparkles, Loader2, BookOpen, Users, TrendingUp, PenTool, ChevronDown, ChevronRight } from 'lucide-react';

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceAuthor, setSourceAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [result, setResult] = useState<AnalysisRecord | null>(null);
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [activeTab, setActiveTab] = useState('new');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    analysisApi.listRecords(id).then(setRecords).catch(() => {});
  }, [id]);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      showToast('error', '请粘贴参考作品文本');
      return;
    }
    if (content.trim().length < 100) {
      showToast('error', '文本太短，至少需要100字');
      return;
    }

    setLoading(true);
    setStage('正在分析结构...');

    const stages = [
      '正在分析结构...',
      '正在分析角色...',
      '正在分析节奏与爽点...',
      '正在提取写作技巧...',
    ];
    let stageIdx = 0;
    const timer = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, stages.length - 1);
      setStage(stages[stageIdx]);
    }, 1500);

    try {
      const res = await analysisApi.analyze(id, {
        content: content.trim(),
        source_title: sourceTitle || '未命名作品',
        source_author: sourceAuthor,
      });
      if (res.success && res.data) {
        setResult({
          id: res.record_id,
          source_title: res.data.source_title,
          source_author: res.data.source_author,
          source_type: 'manual',
          structure_analysis: res.data.structure_analysis,
          character_analysis: res.data.character_analysis,
          rhythm_analysis: res.data.rhythm_analysis,
          techniques: res.data.techniques,
          created_at: new Date().toISOString(),
        });
        setActiveTab('result');
        showToast('success', '拆书分析完成！');
        // 刷新记录列表
        analysisApi.listRecords(id).then(setRecords).catch(() => {});
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : '分析失败');
    } finally {
      clearInterval(timer);
      setLoading(false);
      setStage('');
    }
  };

  const loadRecord = async (recordId: string) => {
    const record = await analysisApi.getRecord(recordId);
    setResult(record);
    setActiveTab('result');
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderJsonSection = (title: string, data: Record<string, unknown> | null) => {
    if (!data || Object.keys(data).length === 0) return null;
    const key = title.replace(/\s+/g, '_');
    const expanded = expandedSections[key] !== false;

    return (
      <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium">{title}</span>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        {expanded && (
          <div className="p-4 bg-white">
            <pre className="text-xs whitespace-pre-wrap font-mono text-[var(--color-text-secondary)] overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">拆书分析</h1>

        <Tabs
          tabs={[
            { key: 'new', label: '新建分析' },
            { key: 'result', label: '分析结果' },
            { key: 'history', label: `历史记录 (${records.length})` },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* 新建分析 */}
        {activeTab === 'new' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>参考作品信息</CardTitle></CardHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="作品名称" value={sourceTitle} onChange={(e) => setSourceTitle(e.target.value)} placeholder="如：斗破苍穹" />
                <Input label="作者" value={sourceAuthor} onChange={(e) => setSourceAuthor(e.target.value)} placeholder="如：天蚕土豆" />
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>粘贴参考作品文本</CardTitle></CardHeader>
              <Textarea
                className="min-h-[300px] font-mono text-sm"
                placeholder="将参考作品的内容粘贴到此处（建议至少粘贴3-5章内容，以便AI充分分析）&#10;&#10;支持分析维度：&#10;- 结构分析：大纲结构、章节脉络、情节设计&#10;- 角色分析：角色设定、关系网、对话风格&#10;- 节奏分析：情绪曲线、爽点设计、钩子手法&#10;- 技巧提取：写作手法、可复用模板、语言风格"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  已输入 {content.length} 字（建议 500-15000 字）
                </span>
                <Button onClick={handleAnalyze} loading={loading}>
                  <Sparkles size={16} /> 开始分析
                </Button>
              </div>
            </Card>

            {loading && (
              <Card>
                <div className="text-center py-8">
                  <Loader2 size={36} className="mx-auto animate-spin text-[var(--color-primary)] mb-4" />
                  <p className="text-sm font-medium">{stage}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    4个并行分析 Agent 运行中...
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* 分析结果 */}
        {activeTab === 'result' && (
          result ? (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-[var(--color-primary)]" />
                    <div>
                      <p className="font-semibold">{result.source_title}</p>
                      {result.source_author && (
                        <p className="text-xs text-[var(--color-text-secondary)]">作者：{result.source_author}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="success">分析完成</Badge>
                </div>
              </Card>

              {renderJsonSection('结构分析 · 大纲结构 / 章节脉络 / 情节设计', result.structure_analysis)}
              {renderJsonSection('角色分析 · 角色设定 / 关系网 / 对话风格', result.character_analysis)}
              {renderJsonSection('节奏分析 · 情绪曲线 / 爽点设计 / 钩子手法', result.rhythm_analysis)}
              {renderJsonSection('技巧提取 · 写作手法 / 可复用模板 / 语言风格', result.techniques)}

              <Button onClick={() => setActiveTab('new')} variant="outline">新建分析</Button>
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Sparkles size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
                <p className="text-[var(--color-text-secondary)]">暂无分析结果</p>
                <Button onClick={() => setActiveTab('new')} className="mt-4">新建分析</Button>
              </div>
            </Card>
          )
        )}

        {/* 历史记录 */}
        {activeTab === 'history' && (
          <Card>
            {records.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-secondary)]">暂无分析记录</div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {records.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className="text-[var(--color-text-placeholder)]" />
                      <div>
                        <p className="text-sm font-medium">{r.source_title}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          {r.source_author && `${r.source_author} · `}
                          {new Date(r.created_at).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => loadRecord(r.id)}>查看</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </MainLayout>
  );
}