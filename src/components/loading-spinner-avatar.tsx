'use client';

import React, { useEffect, useState } from 'react';
import { useAppConfig } from '@/components/config-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LoadingSpinnerAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinnerAvatar({ className, size = 'md' }: LoadingSpinnerAvatarProps) {
  const config = useAppConfig();
  const [avatarSrc, setAvatarSrc] = useState<string>('');
  
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

  useEffect(() => {
    const siteId = sessionStorage.getItem('active_site_id') || 'global';
    const cached = localStorage.getItem(`cached_avatar_${siteId}`);
    if (config.headerAvatar) {
      setAvatarSrc(config.headerAvatar);
    } else if (cached) {
      setAvatarSrc(cached);
    }
  }, [config.headerAvatar]);

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      
      <Avatar className={cn("border-2 border-white/10 shadow-xl bg-zinc-900", avatarSizeClasses[size])}>
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt="Loading" className="object-cover w-full h-full" />
        ) : null}
        <AvatarFallback className="bg-primary text-white font-black">
          {config.siteName.slice(0, 1)}
        </AvatarFallback>
      </Avatar>

      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse -z-10" />
    </div>
  );
}
