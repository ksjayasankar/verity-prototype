'use client';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

interface JsonCodeBoxProps {
  json: object;
}

export default function JsonCodeBox({ json }: JsonCodeBoxProps) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(json, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg bg-slate-900/70">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 transition-colors"
        aria-label="Copy JSON"
      >
        {copied ? <Check size={16} className="text-verified" /> : <Copy size={16} className="text-text-secondary" />}
      </button>
      <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ background: 'transparent', padding: '1rem', margin: 0 }}>
        {jsonString}
      </SyntaxHighlighter>
    </div>
  );
}