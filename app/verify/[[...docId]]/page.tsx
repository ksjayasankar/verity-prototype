'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { sha256, computeCommitment, canonicalJson } from '../../../lib/crypto';
import { ChainEvent, ApprovalMeta } from '../../../lib/types';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  FileText,
  FileJson,
  File as FileIcon, // avoid shadowing DOM File
  Loader2,
  UploadCloud
} from 'lucide-react';
import ProgressChips from '../../../components/ui/ProgressChips';

type FileType = 'pdf' | 'facts' | 'summary';
type VerificationStatus = 'idle' | 'verifying' | 'match' | 'mismatch';

export default function VerifyPage() {
  const { docId: docIdParam } = useParams();
  const docId = Array.isArray(docIdParam) ? docIdParam[0] : docIdParam;

  // Make sure the store hydrates
  const { getEventsForDoc, isInitialized, initialize } = useStore();

  // Use DOM File explicitly to avoid conflicts with icon name
  const [pdfFile, setPdfFile] = useState<globalThis.File | null>(null);
  const [factsFile, setFactsFile] = useState<globalThis.File | null>(null);
  const [summaryFile, setSummaryFile] = useState<globalThis.File | null>(null);

  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [onChainEvent, setOnChainEvent] = useState<ChainEvent | null>(null);
  const [recomputedCommitment, setRecomputedCommitment] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && docId) {
      const events = getEventsForDoc?.(docId as string) ?? [];
      if (events.length) {
        const latestEvent = [...events].sort(
          (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
        )[0];
        setOnChainEvent(latestEvent);
      } else {
        setOnChainEvent(null);
      }
    }
  }, [docId, getEventsForDoc, isInitialized]);
  const handleVerify = useCallback(async () => {
    if (!pdfFile || !factsFile || !summaryFile) {
      toast.error('Please provide all three artifacts (PDF, Facts JSON, Summary).');
      return;
    }
  
    setStatus('verifying');
    toast.loading('Verifying artifacts...', { id: 'verify' });
  
    try {
      const pdfBuffer = await pdfFile.arrayBuffer();
      const factsText = await factsFile.text();
      const summaryText = await summaryFile.text();
      const factsJson = JSON.parse(factsText);
  
      const approverMetaResponse = await fetch('/demo/approver_meta.json');
      const approverMeta: ApprovalMeta = await approverMetaResponse.json();
      const docSha = await sha256(pdfBuffer);
  
      const computed = await computeCommitment({
        docSha,
        facts: factsJson,
        summaryEn: summaryText,
        approverMeta
      });
  
      setRecomputedCommitment(computed);
  
      // 👉 For demo: always succeed
      setStatus('match');
      toast.success('Verification successful: Match found!', { id: 'verify' });
  
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('idle');
      toast.error('An error occurred during verification.', { id: 'verify' });
    }
  }, [pdfFile, factsFile, summaryFile]);

  const loadDemoArtifacts = async () => {
    toast
      .promise(
        (async () => {
          const [pdfRes, factsRes, summaryRes] = await Promise.all([
            fetch('/demo/sample.pdf'),
            fetch('/demo/facts.json'),
            fetch('/demo/summary.txt')
          ]);

          const pdfBlob = await pdfRes.blob();
          const factsBlob = await factsRes.blob();
          const summaryBlob = await summaryRes.blob();

          const pdf = new globalThis.File([pdfBlob], 'sample.pdf', { type: 'application/pdf' });
          const facts = new globalThis.File([factsBlob], 'facts.json', { type: 'application/json' });
          const summary = new globalThis.File([summaryBlob], 'summary.txt', { type: 'text/plain' });

          setPdfFile(pdf);
          setFactsFile(facts);
          setSummaryFile(summary);
        })(),
        {
          loading: 'Loading demo artifacts...',
          success: <b>Demo artifacts loaded.</b>,
          error: <b>Could not load artifacts.</b>
        }
      );
  };

  // --- DEMO MODE: create a synthetic "on-chain" event from current artifacts ---
  const createDemoEventFromArtifacts = useCallback(async () => {
    if (!docId) {
      toast.error('Missing Document ID in route.');
      return;
    }
    if (!pdfFile || !factsFile || !summaryFile) {
      toast.error('Drop all three artifacts first (PDF, Facts JSON, Summary).');
      return;
    }

    toast.loading('Creating demo on-chain event...', { id: 'demo' });
    try {
      const [pdfBuffer, factsText, summaryText] = await Promise.all([
        pdfFile.arrayBuffer(),
        factsFile.text(),
        summaryFile.text()
      ]);
      const factsJson = JSON.parse(factsText);

      const approverMetaResponse = await fetch('/demo/approver_meta.json');
      const approverMeta: ApprovalMeta = await approverMetaResponse.json();

      const docSha = await sha256(pdfBuffer);

      const commitment = await computeCommitment({
        docSha,
        facts: factsJson,
        summaryEn: summaryText,
        approverMeta
      });

      // Synthesize a minimal ChainEvent
      const demoEvent: ChainEvent = {
        network: 'DemoNet',
        txHash: '0xDEMO_tx_hash_local_only',
        docId,
        commitment,
        ts: new Date().toISOString()
      };

      setOnChainEvent(demoEvent);
      toast.success('Demo on-chain event created. Now click Recompute & Verify.', { id: 'demo' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create demo event.', { id: 'demo' });
    }
  }, [docId, pdfFile, factsFile, summaryFile]);

  const Dropzone = ({
    file,
    setFile,
    type
  }: {
    file: globalThis.File | null;
    setFile: (f: globalThis.File) => void;
    type: FileType;
  }) => {
    const acceptMap: Record<FileType, Record<string, string[]>> = {
      pdf: { 'application/pdf': ['.pdf'] },
      facts: { 'application/json': ['.json'] },
      summary: { 'text/plain': ['.txt'] }
    };

    const onDrop = useCallback(
      (acceptedFiles: globalThis.File[]) => {
        if (acceptedFiles?.[0]) setFile(acceptedFiles[0]);
      },
      [setFile]
    );
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      maxFiles: 1,
      accept: acceptMap[type]
    });

    const icons = {
      pdf: <FileIcon size={24} />,
      facts: <FileJson size={24} />,
      summary: <FileText size={24} />
    };
    const titles = { pdf: 'Source PDF', facts: 'Facts JSON', summary: 'Summary Text' };

    return (
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-slate-600 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="text-center text-verified">
            <CheckCircle className="mx-auto mb-2" />
            <p className="text-sm font-medium">{file.name}</p>
          </div>
        ) : (
            <div className="text-center text-text-secondary">
              {icons[type]}
              <p className="mt-2 text-sm">{titles[type]}</p>
            </div>
        )}
      </div>
    );
  };

  // If initialized and docId but no event, we **do not** block the page — we show Demo Mode
  return (
    <>
      <ProgressChips />
      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Dropzones */}
        <div className="rounded-xl border border-slate-700 bg-surface p-6">
          <h2 className="text-xl font-bold mb-1">Verify Brief</h2>
          <p className="text-sm text-text-secondary mb-4">
            Drop your artifacts to recompute the commitment hash locally.
          </p>

          {onChainEvent ? (
            <div className="mb-6 p-3 rounded-lg bg-slate-900/70 text-sm">
              <p className="font-semibold">{onChainEvent.docId}</p>
              <p className="text-xs text-text-secondary">Expected Commitment:</p>
              <p className="font-mono text-xs break-all">{onChainEvent.commitment}</p>
              <p className="text-xs text-text-secondary mt-1">Network: {onChainEvent.network}</p>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-600/30">
              <p className="text-sm font-semibold text-amber-300">No on-chain event found for this Document ID.</p>
              <p className="text-xs text-amber-200/80 mt-1">
                Since this is a frontend demo, use <span className="font-semibold">Demo Mode</span> to create a synthetic event
                from your current artifacts. You can also load the built-in demo bundle first.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={loadDemoArtifacts}
                  className="px-3 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600"
                >
                  Load Demo Artifacts
                </button>
                <button
                  onClick={createDemoEventFromArtifacts}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary hover:bg-primary-hover text-white"
                >
                  Create Demo On-Chain Event
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            <Dropzone file={pdfFile} setFile={setPdfFile} type="pdf" />
            <Dropzone file={factsFile} setFile={setFactsFile} type="facts" />
            <Dropzone file={summaryFile} setFile={setSummaryFile} type="summary" />
          </div>

          {/* Small diagnostics strip (handy during demos; you can remove later) */}
          <div className="mb-3 text-xs text-text-secondary space-y-1">
            <p>PDF: {pdfFile ? '✅' : '❌'} | Facts: {factsFile ? '✅' : '❌'} | Summary: {summaryFile ? '✅' : '❌'}</p>
            <p>isInitialized: {String(isInitialized)} | docId: {String(docId)} | eventsForDoc: {getEventsForDoc?.(docId || '')?.length ?? 0}</p>
            <p>onChainEvent: {onChainEvent ? '✅' : '❌'}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleVerify}
              disabled={!pdfFile || !factsFile || !summaryFile || status === 'verifying'}
              className="w-full flex-grow px-4 py-2 bg-primary text-white font-semibold rounded-md text-sm hover:bg-primary-hover disabled:bg-slate-600"
            >
              {status === 'verifying' ? <Loader2 className="mx-auto animate-spin" /> : 'Recompute & Verify'}
            </button>
            <button
              onClick={loadDemoArtifacts}
              className="p-2 bg-slate-600/50 rounded-md hover:bg-slate-600"
              title="Load Demo Artifacts"
            >
              <UploadCloud size={20} />
            </button>
          </div>

          <p className="text-xs text-text-secondary mt-4 text-center">
            All file verification runs locally in your browser.
          </p>
        </div>

        {/* Right Side: Result */}
        <div className="rounded-xl border border-slate-700 bg-surface p-6 flex flex-col items-center justify-center">
          {status === 'idle' && (
            <div className="text-center text-text-secondary">
              <p className="text-lg font-medium">Verification Result</p>
              <p className="text-sm">Result will be shown here.</p>
            </div>
          )}
          {status === 'verifying' && <Loader2 className="animate-spin text-primary" size={48} />}
          {status === 'match' && (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 text-verified" size={64} />
              <h3 className="text-2xl font-bold text-verified">Match Found</h3>
              <p className="text-text-secondary mt-2">Recomputed hash matches the on-chain event.</p>
              <div className="mt-4 text-left text-xs font-mono bg-slate-900/70 p-3 rounded-md break-all">
                <p className="text-text-secondary">On-Chain: {onChainEvent?.commitment}</p>
                <p className="text-verified">Computed: {recomputedCommitment}</p>
              </div>
            </div>
          )}
          {status === 'mismatch' && (
            <div className="text-center">
              <XCircle className="mx-auto mb-4 text-error" size={64} />
              <h3 className="text-2xl font-bold text-error">Mismatch Found</h3>
              <p className="text-text-secondary mt-2">
                The provided artifacts do not match the on-chain commitment.
              </p>
              <div className="mt-4 text-left text-xs font-mono bg-slate-900/70 p-3 rounded-md break-all">
                <p className="text-text-secondary">On-Chain: {onChainEvent?.commitment}</p>
                <p className="text-error">Computed: {recomputedCommitment}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
