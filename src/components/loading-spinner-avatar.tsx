'use client';

import React from 'react';
import { useAppConfig } from '@/components/config-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LoadingSpinnerAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinnerAvatar({ className, size = 'md' }: LoadingSpinnerAvatarProps) {
  const config = useAppConfig();
  
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const avatarSizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-20 w-20'
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Círculo de carregamento externo */}
      <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      
      {/* Avatar Central */}
      <Avatar className={cn("border-2 border-white/10 shadow-xl", avatarSizeClasses[size])}>
        <AvatarImage src={config.headerAvatar} alt="Loading" />
        <AvatarFallback className="bg-primary text-white font-black">
          {config.siteName.slice(0, 1)}
        </AvatarFallback>
      </Avatar>

      {/* Brilho pulsante */}
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse -z-10" />
    </div>
  );
}
