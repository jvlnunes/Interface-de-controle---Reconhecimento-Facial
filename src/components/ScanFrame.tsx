import type { ReactNode } from 'react';

interface ScanFrameProps {
  children: ReactNode;
  active?: boolean; // mostra a linha de varredura animada
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const corner = 'absolute w-4 h-4 border-accent';

export default function ScanFrame({ children, active = false, size = 'md', className = '' }: ScanFrameProps) {
  const dims = {
    sm: 'w-14 h-14',
    md: 'w-28 h-28',
    lg: 'w-full aspect-square',
  }[size];

  return (
    <div className={`relative ${dims} ${className}`}>
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-ink-2 ring-1 ring-line">
        {children}
        {active && (
          <div className="absolute inset-x-0 top-0 h-[2px] bg-accent shadow-[0_0_8px_var(--color-accent)] scan-line" />
        )}
      </div>
      {/* cantos estilo mira/reticle */}
      <span className={`${corner} top-0 left-0 border-t-2 border-l-2 rounded-tl-md -translate-x-0.5 -translate-y-0.5`} />
      <span className={`${corner} top-0 right-0 border-t-2 border-r-2 rounded-tr-md translate-x-0.5 -translate-y-0.5`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md -translate-x-0.5 translate-y-0.5`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2 rounded-br-md translate-x-0.5 translate-y-0.5`} />
    </div>
  );
}