'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  LayoutDashboard, BookOpen, GitBranch, Users, PenLine, FileText,
  BarChart3, Clock, Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', label: '工作台', icon: LayoutDashboard },
  { href: '/books', label: '我的作品', icon: BookOpen },
  { href: '/settings/models', label: '模型配置', icon: Settings },
];

export function bookNavItems(bookId: string) {
  return [
    { href: `/books/${bookId}`, label: '项目概览', icon: LayoutDashboard },
    { href: `/books/${bookId}/outlines`, label: '大纲管理', icon: GitBranch },
    { href: `/books/${bookId}/detailed-outlines`, label: '细纲管理', icon: FileText },
    { href: `/books/${bookId}/characters`, label: '角色管理', icon: Users },
    { href: `/books/${bookId}/chapters`, label: '章节列表', icon: PenLine },
    { href: `/books/${bookId}/analysis`, label: '拆书分析', icon: BarChart3 },
    { href: `/books/${bookId}/timeline`, label: '时间线', icon: Clock },
    { href: `/books/${bookId}/writing-logs`, label: '写作日志', icon: FileText },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  // 检测是否在书籍详情页
  const bookMatch = pathname.match(/^\/books\/([^/]+)/);
  const bookId = bookMatch ? bookMatch[1] : null;

  const items = bookId ? bookNavItems(bookId) : navItems;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={cn(
      'flex flex-col h-screen bg-[var(--color-card)] border-r border-[var(--color-border)] sticky top-0 transition-all duration-200',
      collapsed ? 'w-16' : 'w-56'
    )}>
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[var(--color-border)]">
        {!collapsed && <span className="font-bold text-lg text-[var(--color-primary)]">AI 小说工坊</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('p-1 rounded-md hover:bg-gray-100 transition-colors', collapsed ? 'mx-auto' : 'ml-auto')}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-gray-50 hover:text-[var(--color-text-primary)]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-[var(--color-border)]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600 transition-colors"
          title={collapsed ? '退出登录' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>退出登录</span>}
        </button>
      </div>
    </aside>
  );
}