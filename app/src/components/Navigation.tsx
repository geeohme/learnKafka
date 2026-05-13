import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import PillButton from './PillButton';

const chapters = [
  { label: 'Overview', href: '#course-overview' },
  { label: 'Ch 1', href: '#chapter-1' },
  { label: 'Ch 2', href: '#chapter-2' },
  { label: 'Ch 3', href: '#chapter-3' },
  { label: 'Ch 4', href: '#chapter-4' },
  { label: 'Ch 5', href: '#chapter-5' },
  { label: 'Ch 6', href: '#chapter-6' },
  { label: 'Ch 7', href: '#chapter-7' },
  { label: 'Check', href: '#knowledge-check' },
  { label: 'Ch 8', href: '#chapter-8' },
  { label: 'Ch 9', href: '#chapter-9' },
  { label: 'Ch 10', href: '#chapter-10' },
  { label: 'Ch 11', href: '#chapter-11' },
  { label: 'Ch 12', href: '#chapter-12' },
  { label: 'Ch 13', href: '#chapter-13' },
];

interface NavigationProps {
  hasUserName: boolean;
  userName: string;
  currentChapter: string;
  onStartLearning: () => void;
  onNavigate: (href: string) => void;
  onGoHome: () => void;
}

export default function Navigation({
  hasUserName,
  userName,
  currentChapter,
  onStartLearning,
  onNavigate,
  onGoHome,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    onNavigate(href);
  };

  const startLearningLabel = hasUserName && isScrolled ? `${userName} - ${currentChapter}` : 'Start Learning';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          isScrolled
            ? 'bg-[rgba(10,10,15,0.85)] backdrop-blur-[20px] border-b border-[#1a1a25]/50'
            : 'bg-transparent'
        }`}
      >
        <div className="container-main flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onGoHome();
            }}
            className="flex items-center gap-1 font-['Syne'] font-bold text-xl text-[#f0f0ff]"
          >
            KAFKA
            <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {chapters.map((ch) => (
              <button
                key={ch.href}
                onClick={() => handleNavClick(ch.href)}
                className="text-[#8a8a9a] hover:text-[#f0f0ff] text-xs font-medium transition-colors duration-300"
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <PillButton variant="secondary" onClick={onStartLearning} className="!py-2.5 !px-6 !text-xs normal-case">
              {startLearningLabel}
            </PillButton>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-[#f0f0ff]"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0f]/95 backdrop-blur-[20px] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <button
            className="absolute top-6 right-6 text-[#f0f0ff]"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="flex flex-col items-center gap-8">
            {chapters.map((ch) => (
              <button
                key={ch.href}
                onClick={() => handleNavClick(ch.href)}
                className="font-['Syne'] font-semibold text-2xl text-[#f0f0ff] hover:text-[#00f5ff] transition-colors"
              >
                {ch.label}
              </button>
            ))}
            <PillButton variant="primary" onClick={onStartLearning} className="mt-4 normal-case">
              {startLearningLabel}
            </PillButton>
          </div>
        </div>
      )}
    </>
  );
}
