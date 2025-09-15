'use client';
import { useStore } from '../../store/useStore';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { settings } = useStore();
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<iframe src="https://verity.example.com/embed/some-doc-id" width="100%" height="400px" frameborder="0"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-6">
        <SettingsCard title="AI & Data">
          <SettingItem label="AI Model Name" value={settings.modelName} />
          <SettingItem label="Model Data Cut-off" value={settings.dataCutoff} />
        </SettingsCard>

        <SettingsCard title="Blockchain">
          <SettingItem label="Network" value={settings.network} />
          <SettingItem label="Contract Address" value={settings.contractAddress} isMono />
        </SettingsCard>

        <SettingsCard title="Disclosure">
          <SettingItem label="Disclosure Text" value={`"${settings.disclosureText}"`} />
        </SettingsCard>
        
        <SettingsCard title="API & Embed">
            <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Embed Snippet</p>
                <div className="relative rounded-md bg-slate-900/70 p-4 font-mono text-sm text-info">
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 transition-colors"
                        aria-label="Copy snippet"
                    >
                        {copied ? <Check size={16} className="text-verified" /> : <Copy size={16} className="text-text-secondary" />}
                    </button>
                    <pre><code>{embedSnippet}</code></pre>
                </div>
            </div>
        </SettingsCard>
      </div>
    </div>
  );
}

const SettingsCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-700 bg-surface p-6">
    <h2 className="text-xl font-semibold mb-4 text-primary">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const SettingItem = ({ label, value, isMono = false }: { label: string, value: string, isMono?: boolean }) => (
  <div>
    <p className="text-sm font-medium text-text-secondary">{label}</p>
    <p className={`text-text-primary ${isMono ? 'font-mono' : ''}`}>{value}</p>
  </div>
);