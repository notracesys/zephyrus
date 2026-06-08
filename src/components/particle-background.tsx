
'use client';

import React, { useState, useEffect } from 'react';

const NUM_PARTICLES = 60;

export default function ParticleBackground() {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: NUM_PARTICLES }).map(() => {
      const size = Math.random() * 3 + 1.5;
      return {
        position: 'absolute',
        left: `${Math.random() * 100}vw`,
        top: '105%', // Inicia fora da tela, na parte inferior
        width: `${size}px`,
        height: `${size}px`,
        // Cor primária com opacidade baixa para um visual nítido porém discreto
        backgroundColor: 'hsla(var(--primary) / 0.35)',
        borderRadius: '50%',
        // Desfoque e brilho removidos para manter a nitidez absoluta
        filter: 'none',
        boxShadow: 'none',
        animation: `rise ${Math.random() * 12 + 18}s linear infinite`,
        animationDelay: `-${Math.random() * 20}s`,
      };
    });
    setParticles(newParticles as React.CSSProperties[]);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-background pointer-events-none">
        {particles.map((style, index) => (
          <div key={index} style={style} />
        ))}
    </div>
  );
}
