'use client';

import React, { useState, useEffect } from 'react';

const NUM_PARTICLES = 100;

export default function ParticleBackground() {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: NUM_PARTICLES }).map(() => {
      const size = Math.random() * 4 + 2;
      return {
        position: 'absolute',
        left: `${Math.random() * 100}vw`,
        top: `${Math.random() * 100}vh`,
        width: `${size}px`,
        height: `${size}px`,
        // Cor primária com opacidade para brilho
        backgroundColor: 'hsla(var(--primary) / 0.8)',
        borderRadius: '50%',
        // Efeito de desfoque e brilho difuso
        filter: 'blur(1.5px)',
        boxShadow: '0 0 15px 4px hsla(var(--primary) / 0.4)',
        animation: `rise ${Math.random() * 2 + 3}s linear infinite`,
        animationDelay: `-${Math.random() * 5}s`,
      };
    });
    setParticles(newParticles as React.CSSProperties[]);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden bg-background">
        {particles.map((style, index) => (
          <div key={index} style={style} />
        ))}
    </div>
  );
}
