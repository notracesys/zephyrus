
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { names } from '@/lib/names';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

const timeDescriptions = [
  'acabou de adquirir o método.',
  'adquiriu há 2 minutos.',
  'adquiriu há 5 minutos.',
  'adquiriu há 10 minutos.',
  'adquiriu há 15 minutos.',
  'adquiriu há 23 minutos.',
  'adquiriu há 42 minutos.',
  'adquiriu há 1 hora.',
];

const EXCLUDED_PATHS = [
  '/chat',
  '/creator-studio-xyz',
  '/portaldochefe',
  '/alerta-urgente',
  '/oferta-recusada',
  '/upsell-bypass'
];

export default function SalesNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [currentTimeText, setCurrentTimeText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || EXCLUDED_PATHS.includes(pathname)) {
      return;
    }

    let timer: NodeJS.Timeout;

    const showRandomNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomTime = timeDescriptions[Math.floor(Math.random() * timeDescriptions.length)];
      setCurrentName(randomName);
      setCurrentTimeText(randomTime);
      setIsVisible(true);

      timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000); // Show for 5 seconds
    };

    const initialTimeout = setTimeout(showRandomNotification, 8000);

    const interval = setInterval(() => {
      showRandomNotification();
    }, Math.random() * (10000 - 5000) + 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isMounted, pathname]);

  if (!isMounted) {
    return null;
  }
  
  if (EXCLUDED_PATHS.includes(pathname)) {
      return null;
  }

  return (
    <div
      className={cn(
        "fixed top-20 left-4 z-50 w-full max-w-[280px] transition-transform duration-500 ease-in-out",
        isVisible ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
      )}
    >
      <Card className="p-3 shadow-2xl bg-background/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary p-2 rounded-full">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-foreground">{currentName}</p>
            <p className="text-muted-foreground">{currentTimeText}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
