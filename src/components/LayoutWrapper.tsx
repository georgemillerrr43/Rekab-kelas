"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';
  const isRecapPublic = pathname === '/recap/public';

  if (isLogin) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}
