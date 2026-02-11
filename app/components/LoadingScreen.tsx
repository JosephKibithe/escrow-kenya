"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadComplete?: () => void;
  minDuration?: number;
}

export default function LoadingScreen({ onLoadComplete, minDuration = 1400 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / minDuration, 1);
      // Ease-out cubic for smooth feel
      const eased = 1 - Math.pow(1 - rawProgress, 3);
      setProgress(eased * 100);

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Start fade out
        setFadeOut(true);
        setTimeout(() => {
          onLoadComplete?.();
        }, 500);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [minDuration, onLoadComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0A0A] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Padlock Logo */}
      <div className="relative z-10 mb-12 animate-float">
        <div className="relative w-28 h-28 md:w-36 md:h-36">
          <Image
            src="/padlock-logo.webp"
            alt="AHADI Escrow"
            fill
            className="object-contain drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]"
            priority
          />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="relative z-10 text-2xl md:text-3xl font-bold text-white tracking-[0.2em] mb-8 text-glow-yellow">
        AHADI
      </h1>

      {/* Loading Bar Container */}
      <div className="relative z-10 w-48 md:w-64 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full loading-bar rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading Text */}
      <p className="relative z-10 mt-4 text-xs text-yellow-500/50 tracking-widest uppercase">
        Securing your deals...
      </p>
    </div>
  );
}
