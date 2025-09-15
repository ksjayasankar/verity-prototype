'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { Draft, ChainEvent, Facts } from '../../../lib/types';
import { GitCommit, GitCompare, FileDiff, ExternalLink } from 'lucide-react';
import { diffWords } from 'diff';

const getFactsDiff = (facts1: Facts, facts2: Facts) => {
    const changes: { key: string, v1: any, v2: any }[] = [];
    const allKeys = new Set([...Object.keys(facts1.fields), ...Object.keys(facts2.fields)]);
    
    allKeys.forEach(key => {
        const v1 = facts1.fields[key];
        const v2 = facts2.fields[key];
        if (JSON.stringify(v1) !== JSON.stringify(v2)) {
            changes.push({ key, v1: v1 ?? 'null', v2: v2 ?? 'null' });
        }
    });
    return changes;
};

export default function VersionDiffPage() {
  const { docId } = useParams();
  const { getDraft, getEventsForDoc, isInitialized } = useStore();
  
  const [v1, setV1] = useState<{ draft: Draft, event: ChainEvent } | null>(null);
  const [v2, setV2] = useState<{ draft: Draft, event: ChainEvent } | null>(null);
  
  useEffect(() => {
    if (isInitialized) {
      const v1Draft = getDraft(`${docId}-V1`);
      const v1Event = getEventsForDoc(`${docId}-V1`)[0];
      const v2Draft = getDraft(`${docId}-V2`);
      const v2Event = getEventsForDoc(`${docId}-V2`)[0];

      if (v1Draft && v1Event) setV1({ draft: v1Draft, event: v1Event });
      if (v2Draft && v2Event) setV2({ draft: v2Draft, event: v2Event });
    }
  }, [docId, getDraft, getEventsForDoc, isInitialized]);
  
  if (!v1 || !v2) {
    return <div className="text-center p-8">Loading version history or not enough versions to compare...</div>;
  }
  
  const factsDiff = getFactsDiff(v1.draft.facts, v2.draft.facts);
  const proseDiff = diffWords(v1.draft.bullets_en.join('\n'), v2.draft.bullets_en.join('\n'));

  return (
    <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-3xl font-bold">Version History</h1>
            <p className="text-text-secondary">{v1.draft.company}</p>
        </header>

        {/* Timeline */}
        <div className="relative mb-12">
            <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-slate-700"></div>
            <div className="flex justify-between items-center w-full">
                <VersionNode version="v1" event={v1.event} draft={v1.draft} align="left" />
                <GitCompare className="text-primary z-10" size={24} />
                <VersionNode version="v2" event={v2.event} draft={v2.draft} align="right" />
            </div>
        </div>

        {/* Diffs */}
        <div className="space-y-8">
            {factsDiff.length > 0 && (
                <div className="rounded-xl border border-slate-700 bg-surface p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FileDiff size={20} /> Changed Fields (Facts JSON)</h2>
                    <div className="space-y-2 text-sm font-mono">
                        {factsDiff.map(({ key, v1, v2 }) => (
                            <div key={key} className="p-2 rounded bg-slate-900/70">
                                <span className="text-text-secondary">{key}: </span>
                                <span className="text-red-400 line-through">{JSON.stringify(v1)}</span>
                                <span className="text-text-secondary mx-1"> → </span>
                                <span className="text-green-400">{JSON.stringify(v2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-slate-700 bg-surface p-6">
                <h2 className="text-xl font-semibold mb-4">Prose Diff (English Summary)</h2>
                <pre className="text-sm whitespace-pre-wrap leading-relaxed">
                    {proseDiff.map((part, index) => (
                        <span key={index} className={part.added ? 'bg-green-500/20 text-green-300' : part.removed ? 'bg-red-500/20 text-red-400 line-through' : 'text-text-secondary'}>
                            {part.value}
                        </span>
                    ))}
                </pre>
            </div>
        </div>
    </div>
  );
}

const VersionNode = ({ version, event, draft, align }: { version: string, event: ChainEvent, draft: Draft, align: 'left' | 'right' }) => (
    <div className={`w-[45%] rounded-xl border border-slate-700 bg-surface p-4 relative ${align === 'left' ? 'text-left' : 'text-right'}`}>
        <div className={`absolute top-1/2 -translate-y-1/2 h-0.5 w-4 bg-slate-700 ${align === 'left' ? '-right-4' : '-left-4'}`}></div>
        <GitCommit className={`absolute top-1/2 -translate-y-1/2 text-slate-700 ${align === 'left' ? '-right-[26px]' : '-left-[26px]'} z-10 bg-background rounded-full`} size={20} />
        <p className="font-bold text-lg text-primary">{version.toUpperCase()}</p>
        <p className="text-sm text-text-secondary mb-2">{new Date(event.ts).toLocaleString()}</p>
        <p className="text-xs text-text-secondary">Commitment:</p>
        <p className="font-mono text-xs break-all">{event.commitment.slice(0,14)}...</p>
        <Link href={`/brief/${draft.docId}`} className="text-primary text-sm font-semibold mt-2 inline-flex items-center gap-1">
            View Brief <ExternalLink size={14} />
        </Link>
    </div>
);