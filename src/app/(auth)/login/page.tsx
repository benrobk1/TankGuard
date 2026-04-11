'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }
      // Smart redirect based on customer status
      const customer = data.customer;
      if (!customer || customer.status === 'PENDING') {
        router.push('/subscribe');
      } else if (!customer.onboardingComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <CardRoot>
      <CardHeader>
        <CardTitle>Log in to your account</CardTitle>
        <CardDescription>Enter your email and password to continue</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" loading={loading} className="w-full">
            Log in
          </Button>
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </CardRoot>
  );
}
