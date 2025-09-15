'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { ChainEvent } from '../../../lib/types';
import { CheckCircle, Loader2 } from 'lucide-react';
import JsonCodeBox from '../../../components/ui/JsonCodeBox';

export default function ExplorerPage() {
  const { txHash } = useParams();
  const { events, isInitialized } = useStore();
  const [event, setEvent] = useState<ChainEvent | null>(null);

  useEffect(() => {
    if (isInitialized) {
      const foundEvent = events.find(e => e.txHash === `0x${txHash}`);
      setEvent(foundEvent || null);
    }
  }, [txHash, events, isInitialized]);

  if (!isInitialized) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }
  
  if (!event) {
    return (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold">Transaction Not Found</h1>
            <p className="font-mono text-text-secondary mt-2 break-all">0x{txHash as string}</p>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
      <div className="flex items-center gap-2 text-verified mb-8">
        <CheckCircle size={20} />
        <span className="font-semibold">Confirmed</span>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-700 bg-surface p-6">
        <InfoRow label="Transaction Hash" value={event.txHash} isMono />
        <InfoRow label="Network" value={event.network} />
        <InfoRow label="Timestamp" value={new Date(event.ts).toUTCString()} />
        <InfoRow label="Publisher ID" value={event.publisherId} isMono />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Event Data: <span className="text-info">Committed</span></h2>
        <JsonCodeBox json={{
            commitment: event.commitment,
            docId: event.docId,
            approverMetaHash: event.approverMetaHash
        }}/>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value, isMono = false }: { label: string, value: string, isMono?: boolean }) => (
  <div className="grid grid-cols-3 gap-4">
    <dt className="text-sm font-medium text-text-secondary">{label}</dt>
    <dd className={`col-span-2 text-sm text-text-primary break-all ${isMono ? 'font-mono' : ''}`}>{value}</dd>
  </div>
);