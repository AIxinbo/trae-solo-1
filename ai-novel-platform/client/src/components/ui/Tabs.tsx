'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: { key: string; label: string }[];
  activeTab?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(tabs[0]?.key || '');
  const current = activeTab ?? internal;

  return (
    <div className={cn('flex border-b border-[var(--color-border)]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => { setInternal(tab.key); onChange?.(tab.key); }}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            current === tab.key
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}