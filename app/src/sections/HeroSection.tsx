import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ParticleCanvas from '@/components/ParticleCanvas';
import PillButton from '@/components/PillButton';
import { ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  hasUserName: boolean;
  onBeginJourney: () => void;
  onExploreChapters: () => void;
}

export default function HeroSection({ hasUserName, onBeginJourney, onExploreChapters }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.8 }, 0.3)
      .from('.hero-title-1', { y: 30, opacity: 0, duration: 0.8 }, 0.5)
      .from('.hero-title-2', { y: 30, opacity: 0, duration: 0.8 }, 0.7)
      .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.8 }, 0.9)
      .from('.hero-ctas', { y: 20, opacity: 0, duration: 0.8 }, 1.1)
      .from('.hero-scroll', { opacity: 0, duration: 0.8 }, 1.5);
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Particle Canvas Background */}
      <ParticleCanvas />

      {/* Ambient glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.06) 0%, transparent 55%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="hero-eyebrow font-['Syne'] font-semibold text-sm tracking-[0.2em] uppercase text-[#ffaa00] mb-6">
          Apache Kafka Fundamentals
        </p>

        <h1 className="font-['Syne'] font-extrabold text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-tight mb-2">
          <span className="hero-title-1 block text-[#f0f0ff]" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.8)' }}>
            Master the Art of
          </span>
          <span className="hero-title-2 block gradient-text" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}>
            Data Streaming
          </span>
        </h1>

        <p className="hero-subtitle font-['Outfit'] text-[1.2rem] text-[#c8c8d8] leading-relaxed max-w-[640px] mx-auto mt-8 mb-10" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
          An interactive journey through Apache Kafka — from transaction streams to production-ready architectures.
        </p>

        <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-4">
          <PillButton variant="primary" onClick={onBeginJourney}>
            {hasUserName ? 'Resume' : 'Start Learning'}
          </PillButton>
          <PillButton variant="secondary" onClick={onExploreChapters}>
            Explore Chapters
          </PillButton>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-6 h-6 text-[#8a8a9a] scroll-bounce" />
      </div>
    </section>
  );
}
