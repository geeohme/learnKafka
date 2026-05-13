import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeaderProps {
  chapter: string;
  title: string;
}

export default function SectionHeader({ chapter, title }: SectionHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    gsap.from(containerRef.current.querySelector('.chapter-num'), {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
    });

    gsap.from(containerRef.current.querySelector('.section-title'), {
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
    });

    gsap.from(containerRef.current.querySelector('.gradient-line'), {
      scaleX: 0,
      duration: 0.8,
      delay: 0.4,
      ease: 'power3.out',
      transformOrigin: 'left center',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="mb-16">
      <span className="chapter-num block font-['Syne'] font-extrabold text-[6rem] leading-none text-[#ffaa00] opacity-30 select-none -mb-8">
        {chapter}
      </span>
      <h2 className="section-title font-['Syne'] font-bold text-[clamp(2rem,4vw,3.5rem)] leading-tight text-[#f0f0ff] tracking-tight">
        {title}
      </h2>
      <div className="gradient-line h-[2px] w-[200px] mt-4 bg-gradient-to-r from-[#00f5ff] to-[#ffaa00]" />
    </div>
  );
}
