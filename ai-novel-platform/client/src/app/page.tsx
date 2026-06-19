'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
        AI 小说写作平台
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-8">
        从拆书到成稿，AI 陪你写出好故事
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          开始使用
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-light)] transition-colors"
        >
          了解更多
        </Link>
      </div>
    </div>
  );
}