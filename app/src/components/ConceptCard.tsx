import { cn } from '@/lib/utils';

interface ConceptCardProps {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ConceptCard({ icon, iconColor = '#00f5ff', title, children, className }: ConceptCardProps) {
  return (
    <div className={cn(
      'bg-[#12121a] rounded-3xl border border-[#1a1a25] p-8 transition-all duration-350 hover:-translate-y-2 hover:border-[rgba(0,245,255,0.3)] hover:shadow-[0_8px_32px_rgba(0,245,255,0.08)]',
      className
    )}>
      <div className="mb-4" style={{ color: iconColor }}>
        {icon}
      </div>
      <h3 className="font-['Syne'] font-semibold text-xl text-[#f0f0ff] mb-3">{title}</h3>
      <div className="text-[#c8c8d8] leading-relaxed text-[1.05rem]">{children}</div>
    </div>
  );
}
