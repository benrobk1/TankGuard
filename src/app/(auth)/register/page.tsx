'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardRoot, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          companyName: form.companyName,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      router.push('/onboarding');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  return (
    <CardRoot>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Get started with TankGuard UST compliance tracking</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {serverError && <Alert variant="error">{serverError}</Alert>}
          <Input
            label="Full Name"
            placeholder="John Smith"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
          />
          <Input
            label="Company Name"
            placeholder="Smith Petroleum LLC"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            error={errors.companyName}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
          />
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </CardRoot>
  );
}
