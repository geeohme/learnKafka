import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  baseY: number;
  speed: number;
  size: number;
  amplitude: number;
  frequency: number;
  phase: number;
  alpha: number;
  color: string;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const isMobile = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    const baseCount = isMobile ? 600 : 1500;
    const accentCount = isMobile ? 100 : 300;

    const particles: Particle[] = [];

    // Base particles (cyan)
    for (let i = 0; i < baseCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseY: Math.random() * height,
        speed: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 1.5,
        amplitude: 30 + Math.random() * 50,
        frequency: 0.002 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.1 + Math.random() * 0.3,
        color: '0, 245, 255',
      });
    }

    // Accent particles (amber)
    for (let i = 0; i < accentCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseY: Math.random() * height,
        speed: 1.5 + Math.random() * 1.5,
        size: 2 + Math.random() * 2,
        amplitude: 20 + Math.random() * 40,
        frequency: 0.003 + Math.random() * 0.004,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.4,
        color: '255, 170, 0',
      });
    }

    particlesRef.current = particles;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        p.x += p.speed;
        p.y = p.baseY + Math.sin(p.x * p.frequency + p.phase) * p.amplitude;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 3;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Wrap around
        if (p.x > width + 10) {
          p.x = -10;
          p.baseY = Math.random() * height;
        }

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
