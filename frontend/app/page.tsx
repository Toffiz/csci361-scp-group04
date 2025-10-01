'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return <div>Loading...</div>;
}
