'use server';

import { cookies } from 'next/headers';
import { User, UserRole } from '@/types';

export async function setSession(user: User) {
  const cookieStore = cookies();
  cookieStore.set('session', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies();
  const session = cookieStore.get('session');
  
  if (!session) {
    return null;
  }
  
  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete('session');
}

export async function setLocale(locale: 'ru' | 'kz') {
  const cookieStore = cookies();
  cookieStore.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
