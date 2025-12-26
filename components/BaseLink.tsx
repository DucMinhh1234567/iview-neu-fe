// components/BaseLink.tsx
'use client';

import Link from 'next/link';
import { withBasePath } from '@/lib/paths';
import { ComponentProps } from 'react';

type BaseLinkProps = ComponentProps<typeof Link>;

export default function BaseLink({ href, ...props }: BaseLinkProps) {
  // Nếu href là string, thêm basePath
  const finalHref = typeof href === 'string' 
    ? withBasePath(href) 
    : href; // Nếu là object, giữ nguyên (Next.js sẽ xử lý)
  
  return <Link href={finalHref} {...props} />;
}

