'use client';

import React, { useState, useEffect } from 'react';

const NUM_PARTICLES = 60;

export default function ParticleBackground() {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: NUM_PARTICLES }).map(() => {
      const size = Math.random() * 4 + 2; // Partículas levemente maiores para visibilidade
      return {
        position: 'absolute',
        left: `${Math.random() * 100}vw`,
        top: '100%', // Começa exatamente na base
        width: `${size}px`,
        height: `${size}px`,
        // Cor sólida baseada na variável primária com alta opacidade
        backgroundColor: 'hsl(var(--primary))',
        opacity: 0.8,
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: `rise ${Math.random() * 10 + 15}s linear infinite`,
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
