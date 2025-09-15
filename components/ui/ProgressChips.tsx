'use client';
import { usePathname } from 'next/navigation';

const steps = [
  { name: 'Ingest', path: '/ingest' },
  { name: 'Draft', path: '/draft' },
  { name: 'Review', path: '/review' },
  { name: 'Brief', path: '/brief' },
  { name: 'Verify', path: '/verify' },
];

export default function ProgressChips() {
  const pathname = usePathname();
  
  let activeIndex = steps.findIndex(step => pathname.startsWith(step.path));
  if (pathname.startsWith('/explorer') || pathname.startsWith('/versions')) activeIndex = -1; // No active step on these pages

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 my-8">
      {steps.map((step, index) => (
        <div key={step.name} className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
              index === activeIndex
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary'
            }`}
          >
            {index + 1}
          </div>
          <span
            className={`hidden sm:inline font-medium ${
              index === activeIndex ? 'text-text-primary' : 'text-text-secondary'
            }`}
          >
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
}