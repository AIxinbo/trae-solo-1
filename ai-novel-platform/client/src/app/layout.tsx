import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AI 小说写作平台',
  description: '从拆书到成稿，AI 陪你写出好故事',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}