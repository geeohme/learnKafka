import { cn } from '@/lib/utils';

interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  href?: string;
  className?: string;
}

export default function PillButton({ children, variant = 'primary', onClick, href, className }: PillButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center px-8 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#00f5ff] to-[#00c8cc] text-[#0a0a0f] hover:brightness-110 hover:scale-[1.02]',
    secondary: 'bg-transparent border border-[#00f5ff] text-[#00f5ff] hover:bg-[#00f5ff]/10',
  };

  const classes = cn(baseClasses, variantClasses[variant], className);

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
