import { useState } from 'react';
import type { FormEvent } from 'react';
import PillButton from './PillButton';

interface WelcomeNameModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
}

export default function WelcomeNameModal({ isOpen, onSave }: WelcomeNameModalProps) {
  const [name, setName] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);

    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0f]/90 px-6 backdrop-blur-[18px]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[440px] rounded-2xl border border-[#00f5ff]/30 bg-[#12121a] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      >
        <p className="font-['Syne'] text-sm font-semibold uppercase tracking-[0.18em] text-[#ffaa00]">
          Welcome
        </p>
        <h2 className="mt-3 font-['Syne'] text-3xl font-bold leading-tight text-[#f0f0ff]">
          What should we call you?
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#c8c8d8]">
          Your name and reading place stay in this browser so the app can bring you back to the right chapter.
        </p>

        <label htmlFor="learner-name" className="mt-6 block text-sm font-semibold text-[#f0f0ff]">
          Name
        </label>
        <input
          id="learner-name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#1a1a25] bg-[#0a0a0f] px-4 py-3 text-[#f0f0ff] outline-none transition focus:border-[#00f5ff] focus:ring-2 focus:ring-[#00f5ff]/20"
          placeholder="Enter your name"
        />
        {hasSubmitted && !name.trim() && (
          <p className="mt-2 text-sm text-[#ff4444]">Please enter your name to begin.</p>
        )}

        <PillButton variant="primary" className="mt-7 w-full" onClick={() => undefined}>
          Begin Learning
        </PillButton>
      </form>
    </div>
  );
}
