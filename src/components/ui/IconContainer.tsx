import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface IconContainerProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  blue: 'bg-blue-500/10 text-blue-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  violet: 'bg-violet-500/10 text-violet-500',
  amber: 'bg-amber-500/10 text-amber-500',
  rose: 'bg-rose-500/10 text-rose-500',
  cyan: 'bg-cyan-500/10 text-cyan-500',
};

const sizeStyles = {
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-14 h-14 rounded-2xl',
  lg: 'w-16 h-16 rounded-2xl',
};

export const IconContainer = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
}: IconContainerProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center transition-all duration-300 group-hover:scale-110',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </div>
  );
};
