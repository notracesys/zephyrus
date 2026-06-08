'use client';

import React, { useState, useEffect } from 'react';

const NUM_PARTICLES = 80;

export default function ParticleBackground() {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: NUM_PARTICLES }).map(() => {
      const size = Math.random() * 3 + 1;
      return {
        position: 'absolute',
        left: `${Math.random() * 100}vw`,
        bottom: '-20px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: 'hsl(var(--primary))',
        opacity: 0.7,
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: `rise ${Math.random() * 10 + 10}s linear infinite`,
        animationDelay: `-${Math.random() * 20}s`,
        zIndex: 1,
      };
    });
    setParticles(newParticles as React.CSSProperties[]);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-background pointer-events-none">
        {particles.map((style, index) => (
          <div key={index} style={style} />
        ))}
    </div>
  );
}
