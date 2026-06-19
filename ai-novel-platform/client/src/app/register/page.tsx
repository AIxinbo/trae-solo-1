'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register({ username, email, password });
      login(res.access_token, res.user);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">注册</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}
          <Input label="用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">注册</Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
          已有账号？<Link href="/login" className="text-[var(--color-primary)] hover:underline">登录</Link>
        </p>
      </Card>
    </div>
  );
}