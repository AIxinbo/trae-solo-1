'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useBookStore } from '@/lib/stores/book-store';
import { Plus, PenLine, MoreHorizontal, Trash2 } from 'lucide-react';

export default function BooksPage() {
  const router = useRouter();
  const { books, fetchBooks, createBook, deleteBook, loading } = useBookStore();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('玄幻');

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const book = await createBook({ title, genre });
    setShowCreate(false);
    setTitle('');
    router.push(`/books/${book.id}`);
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = { draft: '草稿', writing: '连载中', completed: '已完结', published: '已发布' };
    return map[s] || s;
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">我的作品</h1>
          <Button onClick={() => setShowCreate(true)}><Plus size={18} /> 新建作品</Button>
        </div>

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="新建作品">
          <div className="space-y-4">
            <Input label="作品标题" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select
              label="作品类型"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              options={['玄幻', '仙侠', '都市', '历史', '科幻', '悬疑', '游戏', '轻小说'].map((g) => ({ value: g, label: g }))}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>取消</Button>
              <Button onClick={handleCreate}>创建</Button>
            </div>
          </div>
        </Modal>

        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">加载中...</div>
        ) : books.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <PenLine size={48} className="mx-auto text-[var(--color-text-placeholder)] mb-3" />
              <p className="text-[var(--color-text-secondary)]">还没有作品，点击上方按钮创建</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <Link href={`/books/${book.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate hover:text-[var(--color-primary)] transition-colors">{book.title}</h3>
                  </Link>
                  <button
                    onClick={() => { if (confirm('确定删除这个作品？')) deleteBook(book.id); }}
                    className="p-1 rounded hover:bg-red-50 text-[var(--color-text-placeholder)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <span>{book.genre}</span>
                  <span>·</span>
                  <span>{book.word_count_target.toLocaleString()}字目标</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={book.status === 'published' ? 'success' : book.status === 'writing' ? 'info' : 'default'}>
                    {statusLabel(book.status)}
                  </Badge>
                  <span className="text-xs text-[var(--color-text-placeholder)]">
                    {new Date(book.updated_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}