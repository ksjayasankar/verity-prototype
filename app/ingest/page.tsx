'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import ProgressChips from '../../components/ui/ProgressChips';
import { mockApi } from '../../lib/mockApi';

export default function IngestPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [ingestMode, setIngestMode] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('https://www.bseindia.com/xml-data/corpfiling/AttachLive/some-report.pdf');

  const handleExtract = async () => {
    setIsLoading(true);
    toast.loading('Parsing disclosure...', { id: 'ingest' });
    try {
      const newDraft = await mockApi.ingest(url);
      toast.success('Parsing complete!', { id: 'ingest' });
      router.push(`/draft/${newDraft.docId}`);
    } catch (error) {
      toast.error('Failed to ingest document.', { id: 'ingest' });
      setIsLoading(false);
    }
  };

  return (
    <>
      <ProgressChips />
      <div className="max-w-xl mx-auto mt-12">
        <div className="rounded-xl border border-slate-700 bg-surface p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center text-text-primary mb-6">Add a Disclosure</h2>
          
          <div className="space-y-6">
            {/* URL Ingest */}
            <div className={`rounded-lg border p-4 transition-all ${ingestMode === 'url' ? 'border-primary' : 'border-slate-700'}`}>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="ingest-mode" value="url" checked={ingestMode === 'url'} onChange={() => setIngestMode('url')} className="h-4 w-4 text-primary focus:ring-primary border-slate-600 bg-surface"/>
                <span className="ml-3 font-medium text-text-primary">URL</span>
              </label>
              {ingestMode === 'url' && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter BSE/NSE disclosure URL"
                    className="flex-grow bg-slate-900/70 border-slate-700 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleExtract}
                    disabled={isLoading || !url}
                    className="px-4 py-2 bg-primary text-white font-semibold rounded-md text-sm hover:bg-primary-hover disabled:bg-slate-600 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Extracting...' : 'Extract'}
                  </button>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className={`rounded-lg border p-4 transition-all ${ingestMode === 'upload' ? 'border-primary' : 'border-slate-700'}`}>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="ingest-mode" value="upload" checked={ingestMode === 'upload'} onChange={() => setIngestMode('upload')} className="h-4 w-4 text-primary focus:ring-primary border-slate-600 bg-surface"/>
                <span className="ml-3 font-medium text-text-primary">Upload</span>
              </label>
              {ingestMode === 'upload' && (
                 <div className="mt-4 text-center text-text-secondary text-sm">
                   <p>File upload is a feature for a full implementation.</p>
                   <p>For this demo, please use the URL option.</p>
                 </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-text-secondary">
            <ShieldCheck size={16} className="text-verified" />
            <p>We never put documents on-chain; only a hash commitment.</p>
          </div>
        </div>
      </div>
    </>
  );
}