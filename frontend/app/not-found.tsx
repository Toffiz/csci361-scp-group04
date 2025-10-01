'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found. Redirecting...</p>
      </div>
    </div>
  );
}
