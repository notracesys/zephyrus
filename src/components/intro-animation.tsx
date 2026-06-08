
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
    }, 2000); 

    const glitchTimer = setTimeout(() => {
      setPhase('fading');
    }, 2000 + 1000); 

    const fadeTimer = setTimeout(() => {
        setPhase('hidden');
        onAnimationComplete();
    }, 2000 + 1000 + 500); 

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
        "fixed inset-0 z-[10000] flex items-center justify-center bg-background transition-opacity duration-500",
        phase === 'fading' ? 'opacity-0' : 'opacity-100'
    )}>
        <style jsx>{`
          .glitch-wrapper {
            position: relative;
          }
          .animate-text-pulse {
            animation: text-pulse 2s infinite ease-in-out;
          }
          @keyframes text-pulse {
            0%, 100% { opacity: 0.5; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1); }
          }
          .glitch {
            position: relative;
            color: hsl(var(--primary));
          }
          .glitch::before,
          .glitch::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
          }
          .glitch::before {
            left: 2px;
            text-shadow: -2px 0 #ff00c1;
            clip: rect(44px, 450px, 56px, 0);
            animation: glitch-anim 5s infinite linear alternate-reverse;
          }
          .glitch::after {
            left: -2px;
            text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1;
            animation: glitch-anim2 1s infinite linear alternate-reverse;
          }
          @keyframes glitch-anim {
            0% { clip: rect(31px, 9999px, 94px, 0); }
            20% { clip: rect(62px, 9999px, 42px, 0); }
            40% { clip: rect(16px, 9999px, 78px, 0); }
            60% { clip: rect(89px, 9999px, 13px, 0); }
            80% { clip: rect(25px, 9999px, 99px, 0); }
            100% { clip: rect(54px, 9999px, 32px, 0); }
          }
          @keyframes glitch-anim2 {
            0% { clip: rect(65px, 9999px, 100px, 0); }
            20% { clip: rect(10px, 9999px, 30px, 0); }
            40% { clip: rect(80px, 9999px, 50px, 0); }
            60% { clip: rect(40px, 9999px, 90px, 0); }
            80% { clip: rect(20px, 9999px, 70px, 0); }
            100% { clip: rect(50px, 9999px, 20px, 0); }
          }
        `}</style>
        <div className="glitch-wrapper">
             <h1
                className={cn(
                    "font-headline text-4xl md:text-7xl font-black tracking-[0.2em] text-center italic uppercase",
                    phase === 'pulsing' && 'text-primary/50 animate-text-pulse',
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
