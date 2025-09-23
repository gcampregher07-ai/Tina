
"use client";

import { usePathname } from 'next/navigation';
import { TopBar } from './top-bar';

export function LayoutManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTopBar = !pathname.startsWith('/dashboard') && pathname !== '/login';

  return (
    <>
      {showTopBar && <TopBar />}
      {children}
    </>
  );
}
