'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../store/useStore';
import Image from 'next/image';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { initialize } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between border-b border-slate-700">
            {/* The "Verity" h1 tag is now removed from this Link */}
            <Link href="/ingest">
              <Image
                src="/logo_verity.png"
                alt="Verity Logo"
                width={130} 
                height={42}
                priority
              />
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/versions/NSE-2025-08-12-RELIANCE" className="text-text-secondary hover:text-primary transition-colors">
                Versions
              </Link>
              <Link href="/settings" className="text-text-secondary hover:text-primary transition-colors">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}