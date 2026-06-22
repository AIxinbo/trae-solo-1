'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useBookStore } from '@/lib/stores/book-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BookOpen, Plus, PenLine, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WorkbenchPage() {
  const router = useRouter();
  const { loadFromStorage } = useAuthStore();
  const { books, fetchBooks, loading } = useBookStore();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('玄幻');

  useEffect(() => {
    loadFromStorage();
    if (!useAuthStore.getState().isLoggedIn) {
      router.replace('/login');
      return;
    }
    fetchBooks().catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const book = await useBookStore.getState().createBook({ title, genre });
    setShowCreate(false);
    setTitle('');
    router.push(`/books/${book.id}`);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">工作台</h1>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={18} /> 新建作品
          </Button>
        </div>

        {/* 新建作品表单 */}
        {showCreate && (
          <Card>
            <CardHeader><CardTitle>新建作品</CardTitle></CardHeader>
            <div className="flex gap-3">
              <input
                className="flex-1 h-10 px-3 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                placeholder="作品标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <select
                className="h-10 px-3 rounded-lg border border-[var(--color-border)] text-sm"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                {['玄幻', '仙侠', '都市', '历史', '科幻', '悬疑', '游戏', '轻小说'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <Button onClick={handleCreate}>创建</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>取消</Button>
            </div>
          </Card>
        )}

        {/* 作品列表 */}
        <Card>
          <CardHeader>
            <CardTitle>我的作品</CardTitle>
            <Link href="/books" className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1">
              查看全部 <ArrowRight size={14} />
            </Link>
          </CardHeader>
          {loading ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)]">加载中...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
              <p className="text-[var(--color-text-secondary)]">还没有作品，点击上方按钮创建你的第一部小说</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {books.slice(0, 6).map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex items-center gap-3 p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
                    <PenLine size={20} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{book.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{book.genre} · {book.word_count_target.toLocaleString()}字</p>
                  </div>
                  <Badge variant={book.status === 'published' ? 'success' : 'default'}>
                    {book.status === 'draft' ? '草稿' : book.status === 'writing' ? '连载中' : '已完结'}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* 快速入口 */}
        <Card>
          <CardHeader><CardTitle>快速入门</CardTitle></CardHeader>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { step: 1, title: '创建作品', desc: '设定书名、类型和世界观' },
              { step: 2, title: '设计大纲', desc: '规划故事结构和章节脉络' },
              { step: 3, title: '开始写作', desc: 'AI 辅助逐章创作正文' },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-lg bg-gray-50 border border-[var(--color-border)]">
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs flex items-center justify-center mb-2 font-medium">
                  {item.step}
                </div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}