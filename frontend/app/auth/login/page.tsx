'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, UserRole } from '@/types';
import Link from 'next/link';

// Mock users database (in localStorage)
const getMockUsers = () => {
  const stored = localStorage.getItem('users');
  if (!stored) {
    // Create default users
    const defaultUsers = [
      { email: 'owner@scp.kz', password: 'owner123', name: 'John Doe', companyName: 'SCP Corp', role: UserRole.OWNER },
      { email: 'admin@scp.kz', password: 'admin123', name: 'Jane Smith', companyName: 'SCP Corp', role: UserRole.ADMIN },
      { email: 'sales@scp.kz', password: 'sales123', name: 'Bob Johnson', companyName: 'SCP Corp', role: UserRole.SALES },
      { email: 'consumer@scp.kz', password: 'consumer123', name: 'Alice Brown', companyName: 'Consumer Co', role: UserRole.CONSUMER },
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(stored);
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = getMockUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    // Create session
    const session: User = {
      id: user.email,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: 'company-1',
      companyName: user.companyName,
      active: true,
    };

    localStorage.setItem('session', JSON.stringify(session));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to SCP</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>

            <div className="mt-4 p-3 bg-slate-100 rounded text-xs space-y-1">
              <div className="font-semibold">Demo accounts:</div>
              <div>Owner: owner@scp.kz / owner123</div>
              <div>Admin: admin@scp.kz / admin123</div>
              <div>Sales: sales@scp.kz / sales123</div>
              <div>Consumer: consumer@scp.kz / consumer123</div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
