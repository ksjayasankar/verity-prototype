'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { Draft } from '../../../lib/types';
import ProgressChips from '../../../components/ui/ProgressChips';
import JsonCodeBox from '../../../components/ui/JsonCodeBox';
import EvidenceChip from '../../../components/ui/EvidenceChip';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function DraftPage() {
  const router = useRouter();
  const { docId } = useParams();
  const { getDraft, isInitialized } = useStore();
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (isInitialized) {
      const foundDraft = getDraft(docId as string);
      if (foundDraft) {
        setDraft(foundDraft);
      } else {
        // Handle not found case, maybe redirect
      }
    }
  }, [docId, getDraft, isInitialized]);

  if (!isInitialized || !draft) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <>
      <ProgressChips />
      <div className="max-w-6xl mx-auto mt-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{draft.company}</h1>
          <p className="text-text-secondary">{draft.title}</p>
          <p className="text-sm text-text-secondary">Filing Date: {draft.filing_date}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Pane: Facts JSON */}
          <div className="rounded-xl border border-slate-700 bg-surface p-6">
            <h2 className="text-xl font-semibold mb-4">AI Extracted Facts</h2>
            <JsonCodeBox json={draft.facts} />
          </div>

          {/* Right Pane: Summary */}
          <div className="rounded-xl border border-slate-700 bg-surface p-6">
            <h2 className="text-xl font-semibold mb-4">AI Generated Summary</h2>
            <ul className="space-y-3">
              {draft.bullets_en.map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2 mt-1">•</span>
                  <span className="flex-grow">
                    {bullet}
                    {draft.facts.evidence['director_name'] && <EvidenceChip page={draft.facts.evidence['director_name'].page} quote={draft.facts.evidence['director_name'].quote} />}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push(`/review/${docId}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-hover transition-colors"
          >
            Continue to Review <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
}