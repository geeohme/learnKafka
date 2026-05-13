import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizCardProps {
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function QuizCard({ category, question, options, correctIndex, explanation }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
  };

  const isCorrect = selected === correctIndex;

  return (
    <div 
      className={`bg-[#12121a] rounded-3xl border p-8 transition-all duration-500 ${
        answered 
          ? isCorrect 
            ? 'border-[#00f5ff] shadow-[0_0_20px_rgba(0,245,255,0.1)]' 
            : 'border-[#ff4444] shadow-[0_0_20px_rgba(255,68,68,0.1)]'
          : 'border-[#1a1a25]'
      }`}
    >
      <span className="inline-block font-['Syne'] font-semibold text-xs uppercase tracking-[0.15em] text-[#ffaa00] mb-4">
        {category}
      </span>
      <h3 className="font-['Syne'] font-semibold text-lg text-[#f0f0ff] mb-6">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => {
          let btnClass = 'w-full text-left p-4 rounded-xl border transition-all duration-300 text-sm ';
          
          if (!answered) {
            btnClass += 'border-[#1a1a25] bg-[#1a1a25]/50 text-[#c8c8d8] hover:border-[rgba(0,245,255,0.3)] hover:bg-[#1a1a25]';
          } else if (index === correctIndex) {
            btnClass += 'border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff]';
          } else if (index === selected && index !== correctIndex) {
            btnClass += 'border-[#ff4444] bg-[#ff4444]/10 text-[#ff4444]';
          } else {
            btnClass += 'border-[#1a1a25] bg-[#1a1a25]/30 text-[#8a8a9a]';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={answered}
              className={btnClass}
            >
              <div className="flex items-center gap-3">
                <span className="font-['JetBrains_Mono'] text-xs opacity-60">
                  {String.fromCharCode(65 + index)})
                </span>
                <span className="flex-1">{option}</span>
                {answered && index === correctIndex && (
                  <CheckCircle className="w-5 h-5 text-[#00f5ff] flex-shrink-0" />
                )}
                {answered && index === selected && index !== correctIndex && (
                  <XCircle className="w-5 h-5 text-[#ff4444] flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 pt-6 border-t border-[#1a1a25] animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-[#00f5ff]" />
            ) : (
              <XCircle className="w-5 h-5 text-[#ff4444]" />
            )}
            <span className={`font-['Syne'] font-semibold text-sm ${isCorrect ? 'text-[#00f5ff]' : 'text-[#ff4444]'}`}>
              {isCorrect ? 'Correct!' : 'Not quite'}
            </span>
          </div>
          <p className="text-[#c8c8d8] text-sm leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
