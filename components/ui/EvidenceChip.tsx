'use client';
import * as Popover from '@radix-ui/react-popover';
import { BookText } from 'lucide-react';

interface EvidenceChipProps {
  page: number;
  quote: string;
}

export default function EvidenceChip({ page, quote }: EvidenceChipProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="ml-2 inline-block cursor-pointer rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
          p.{page}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={5}
          className="z-50 w-72 rounded-lg bg-slate-800 p-4 shadow-lg ring-1 ring-slate-700 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div className="flex items-start gap-3">
             <BookText className="h-4 w-4 text-text-secondary mt-1 flex-shrink-0" />
            <p className="text-sm text-text-secondary leading-relaxed">"{quote}"</p>
          </div>
          <Popover.Arrow className="fill-slate-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}