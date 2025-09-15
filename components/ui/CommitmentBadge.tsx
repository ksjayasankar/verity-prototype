import Link from 'next/link';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface CommitmentBadgeProps {
  commitment: string;
  txHash: string;
}

export default function CommitmentBadge({ commitment, txHash }: CommitmentBadgeProps) {
  const truncatedCommitment = `${commitment.slice(0, 8)}...${commitment.slice(-8)}`;

  return (
    <div className="rounded-xl border border-slate-700 bg-surface p-4">
      <h3 className="text-sm font-semibold text-text-secondary mb-2">INTEGRITY</h3>
      <div className="mb-4">
        <p className="text-xs text-text-secondary">COMMITMENT</p>
        <p className="font-mono text-sm text-text-primary break-all">{truncatedCommitment}</p>
      </div>
      <div className="flex items-center gap-2 text-verified mb-4">
        <ShieldCheck size={18} />
        <span className="font-semibold text-sm">Verified On-Chain</span>
      </div>
      <Link
        href={`/explorer/${txHash}`}
        target="_blank"
        className="w-full flex items-center justify-center gap-2 rounded-md bg-slate-600/50 px-3 py-2 text-sm font-medium text-text-primary hover:bg-slate-600 transition-colors"
      >
        View on Block Explorer
        <ExternalLink size={16} />
      </Link>
    </div>
  );
}