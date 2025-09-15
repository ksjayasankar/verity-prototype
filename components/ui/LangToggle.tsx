'use client';

interface LangToggleProps {
  lang: 'en' | 'local';
  setLang: (lang: 'en' | 'local') => void;
}

export default function LangToggle({ lang, setLang }: LangToggleProps) {
  return (
    <div className="flex rounded-md bg-surface p-1">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 text-sm font-medium rounded ${
          lang === 'en' ? 'bg-primary text-white' : 'text-text-secondary'
        } transition-all`}
      >
        English
      </button>
      <button
        onClick={() => setLang('local')}
        className={`px-3 py-1 text-sm font-medium rounded ${
          lang === 'local' ? 'bg-primary text-white' : 'text-text-secondary'
        } transition-all`}
      >
        Hindi
      </button>
    </div>
  );
}