import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  examples: {
    language: string;
    code: string;
  }[];
  title?: string;
}

export default function CodeBlock({ examples, title }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(examples[activeTab].code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
      {title && (
        <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
          <h3 className="text-cyan-400 font-semibold text-lg">{title}</h3>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/50">
        <div className="flex gap-1 p-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded transition-all duration-200 text-sm font-medium ${
                activeTab === index
                  ? 'bg-slate-700 text-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {example.language}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="mr-3 p-2 hover:bg-slate-700 rounded transition-colors duration-200 text-slate-400 hover:text-cyan-400"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="p-4 overflow-x-auto bg-slate-900">
        <pre className="font-mono text-sm text-slate-100 whitespace-pre-wrap break-words">
          <code>{examples[activeTab].code}</code>
        </pre>
      </div>
    </div>
  );
}
