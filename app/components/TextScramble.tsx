"use client";

import { useState, useEffect, useRef } from "react";

const GLYPHS = "█▓░▒₿ΞⒶⒽⒹ◆●★⬡⏣⚡";

// Use a deterministic pseudo-random function for SSR hydration safety
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

interface TextScrambleProps {
  text: string;
  className?: string;
  /** Delay in ms before the scramble starts */
  delay?: number;
  /** How fast each character resolves (ms per char) */
  speed?: number;
  /** Pause duration in ms after text fully resolves before re-scrambling */
  pauseDuration?: number;
}

export default function TextScramble({
  text,
  className = "",
  delay = 0,
  speed = 45,
  pauseDuration = 4000,
}: TextScrambleProps) {
  const [displayed, setDisplayed] = useState("");
  const [resolved, setResolved] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const hasStarted = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scramble = () => {
      const now = performance.now();
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;

      const charsResolved = Math.min(Math.floor(elapsed / speed), text.length);

      setResolved(charsResolved);

      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (i < charsResolved) {
          result += text[i];
        } else if (text[i] === " ") {
          result += " ";
        } else {
          result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      setDisplayed(result);

      if (charsResolved < text.length) {
        rafRef.current = requestAnimationFrame(scramble);
      } else {
        // Text fully resolved — pause, then restart
        setDisplayed(text);
        pauseTimerRef.current = setTimeout(() => {
          startRef.current = 0;
          setResolved(0);
          rafRef.current = requestAnimationFrame(scramble);
        }, pauseDuration);
      }
    };

    // Initial delay before first scramble
    const initTimer = setTimeout(() => {
      hasStarted.current = true;
      startRef.current = 0;
      rafRef.current = requestAnimationFrame(scramble);
    }, delay);

    return () => {
      clearTimeout(initTimer);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, delay, pauseDuration]);

  // Before animation starts, show scrambled glyphs
  if (!hasStarted.current) {
    const placeholder = text
      .split("")
      .map((ch, i) =>
        ch === " " ? " " : GLYPHS[Math.floor(seededRandom(i) * GLYPHS.length)],
      )
      .join("");

    return (
      <span className={className} aria-label={text}>
        {placeholder.split("").map((ch, i) => (
          <span
            key={i}
            className="inline-block text-scramble-char"
            style={{ opacity: 0.4 }}
          >
            {ch}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className} aria-label={text}>
      {displayed.split("").map((ch, i) => (
        <span
          key={i}
          className={`inline-block ${
            i < resolved ? "text-scramble-resolved" : "text-scramble-char"
          }`}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
