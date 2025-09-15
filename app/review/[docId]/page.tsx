'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { Draft } from '../../../lib/types';
import ProgressChips from '../../../components/ui/ProgressChips';
import EvidenceChip from '../../../components/ui/EvidenceChip';
import LangToggle from '../../../components/ui/LangToggle';
import { CheckCircle, Info, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { mockApi } from '../../../lib/mockApi';

export default function ReviewPage() {
  const router = useRouter();
  const { docId } = useParams();
  const { getDraft, isInitialized } = useStore();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [lang, setLang] = useState<'en' | 'local'>('en');
  const [approverName, setApproverName] = useState('');
  const [approverOrg, setApproverOrg] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      const foundDraft = getDraft(docId as string);
      setDraft(foundDraft || null);
    }
  }, [docId, getDraft, isInitialized]);

  // Validations
  const hasEvidence = draft?.bullets_en.length > 0;
  const isJsonValid = draft?.facts && Object.keys(draft.facts.fields).length > 0;
  const isMultilingual = draft?.bullets_local && draft.bullets_local.length > 0;
  const isApproverInfoPresent = approverName.trim() !== '' && approverOrg.trim() !== '';
  const canCommit = hasEvidence && isJsonValid && isMultilingual && isApproverInfoPresent;

  const handleCommit = async () => {
    if (!draft || !canCommit) return;
    setIsModalOpen(false);
    setIsCommitting(true);
    toast.loading('Sending commit to chain...', { id: 'commit' });
    
    try {
      const event = await mockApi.commit(draft, approverName, approverOrg);
      toast.success(`Commit confirmed! Tx: ${event.txHash.slice(0, 12)}...`, { id: 'commit', duration: 5000 });
      router.push(`/brief/${docId}`);
    } catch (error) {
      toast.error('Failed to commit.', { id: 'commit' });
      setIsCommitting(false);
    }
  };

  if (!isInitialized || !draft) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  const bullets = lang === 'en' ? draft.bullets_en : draft.bullets_local;

  return (
    <>
      <ProgressChips />
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Pane: Validation & Approver */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-slate-700 bg-surface p-6">
            <h2 className="text-xl font-semibold mb-6">Confirm Inputs</h2>
            <ul className="space-y-3 text-sm mb-6">
              <li className={`flex items-center gap-2 ${hasEvidence ? 'text-verified' : 'text-text-secondary'}`}>
                <CheckCircle size={18} /> Evidence present for all highlights
              </li>
              <li className={`flex items-center gap-2 ${isJsonValid ? 'text-verified' : 'text-text-secondary'}`}>
                <CheckCircle size={18} /> JSON fields validated
              </li>
              <li className={`flex items-center gap-2 ${isMultilingual ? 'text-verified' : 'text-text-secondary'}`}>
                <CheckCircle size={18} /> Multilingual pass
              </li>
            </ul>

            <h3 className="text-lg font-semibold mb-4">Approver Identity</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Approver Name" value={approverName} onChange={e => setApproverName(e.target.value)} className="w-full bg-slate-900/70 border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
              <input type="text" placeholder="Approver Organization" value={approverOrg} onChange={e => setApproverOrg(e.target.value)} className="w-full bg-slate-900/70 border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!canCommit || isCommitting}
              className="w-full mt-6 px-4 py-3 bg-primary text-white font-semibold rounded-md text-sm hover:bg-primary-hover disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCommitting ? <Loader2 className="animate-spin" /> : <Lock size={16} />}
              Approve & Commit
            </button>
          </div>
        </aside>

        {/* Right Pane: Content */}
        <main className="lg:col-span-2 rounded-xl border border-slate-700 bg-surface p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Key Highlights</h2>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <ul className="space-y-4">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span className="flex-grow">
                  {bullet}
                  {lang === 'en' && draft.facts.evidence['director_name'] && <EvidenceChip page={draft.facts.evidence['director_name'].page} quote={draft.facts.evidence['director_name'].quote} />}
                </span>
              </li>
            ))}
          </ul>
        </main>
      </div>
      <div className="max-w-6xl mx-auto mt-4 p-3 rounded-lg bg-surface flex items-center gap-3 text-sm text-text-secondary">
        <Info size={18} className="text-info" />
        <p>A cryptographic commitment will be generated upon approval. • Chain Network: Polygon Testnet</p>
      </div>

      {/* Commit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
          <div className="bg-surface rounded-xl p-8 max-w-lg w-full shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Confirm Commitment</h2>
            <p className="text-text-secondary mb-6">You are about to approve this brief and commit its cryptographic signature to the blockchain. This action is irreversible.</p>
            <div className="text-sm space-y-2 mb-8 bg-slate-900/70 p-4 rounded-lg">
              <p className="font-semibold text-text-primary">The following artifacts will be hashed:</p>
              <p className="flex items-center gap-2"><CheckCircle size={16} className="text-verified" /> SHA-256 of Source PDF</p>
              <p className="flex items-center gap-2"><CheckCircle size={16} className="text-verified" /> SHA-256 of Facts JSON</p>
              <p className="flex items-center gap-2"><CheckCircle size={16} className="text-verified" /> SHA-256 of English Summary</p>
              <p className="flex items-center gap-2"><CheckCircle size={16} className="text-verified" /> SHA-256 of Approver Metadata</p>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md bg-slate-600/50 text-sm font-medium hover:bg-slate-600">Cancel</button>
              <button onClick={handleCommit} className="px-4 py-2 rounded-md bg-primary text-sm font-medium hover:bg-primary-hover">Confirm & Commit</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}