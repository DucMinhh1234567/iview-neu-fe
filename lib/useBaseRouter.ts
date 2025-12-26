// lib/useBaseRouter.ts
'use client';

import { useRouter as useNextRouter } from 'next/navigation';
import { withBasePath } from './paths';

export function useBaseRouter() {
  const router = useNextRouter();
  
  return {
    ...router,
    push: (href: string) => router.push(withBasePath(href)),
    replace: (href: string) => router.replace(withBasePath(href)),
    prefetch: (href: string) => router.prefetch(withBasePath(href)),
  };
}

