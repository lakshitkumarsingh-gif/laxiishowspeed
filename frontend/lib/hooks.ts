import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export function useAuth() {
  const router = useRouter();
  const { user, token } = useStore();

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!isAuthenticated) {
      // router.push('/');
    }
  }, [isAuthenticated]);

  return { user, token, isAuthenticated };
}
