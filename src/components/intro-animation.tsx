'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppConfig } from '@/components/config-provider';

interface IntroAnimationProps {
  onAnimationComplete: () => void;
}

export default function IntroAnimation({ onAnimationComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<'pulsing' | 'glitching' | 'fading' | 'hidden'>('pulsing');
  const config = useAppConfig();
  const siteName = config.siteName.toUpperCase();

  useEffect(() => {
    const pulseTimer = setTimeout(() => {
      setPhase('glitching');
    }, 3000); // Pulse for 3 seconds

    const glitchTimer = setTimeout(() => {
      setPhase('fading');
    }, 3000 + 1500); // Glitch for 1.5 seconds

    const fadeTimer = setTimeout(() => {
        setPhase('hidden');
        onAnimationComplete();
    }, 3000 + 1500 + 500); // Fade for 0.5 seconds

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(glitchTimer);
      clearTimeout(fadeTimer);
    };
  }, [onAnimationComplete]);

  if (phase === 'hidden') {
    return null;
  }

  return (
    <div className={cn(
        "flex items-center justify-center min-h-screen bg-background transition-opacity duration-500",
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
    )}>
        <div className="glitch-wrapper">
             <h1
                className={cn(
                    "font-headline text-5xl md:text-7xl font-bold tracking-widest text-center",
                    phase === 'pulsing' && 'text-primary animate-text-pulse',
                    phase === 'glitching' && 'glitch'
                )}
                data-text={siteName}
             >
                {siteName}
            </h1>
        </div>
    </div>
  );
}