"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Dot positions on a 3×3 grid (indices 0–8, row-major)
const DOTS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

interface Props {
  face: number;
  rolling: boolean;
  onRollComplete?: () => void;
  size?: number;
}

export default function Die({ face, rolling, onRollComplete, size = 72 }: Props) {
  const controls = useAnimation();
  const [displayFace, setDisplayFace] = useState(face);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!rolling || startedRef.current) return;
    startedRef.current = true;

    // Rapid face cycling that slows toward the end
    const steps = 14;
    let step = 0;

    function cycle() {
      step++;
      if (step < steps) {
        setDisplayFace(Math.floor(Math.random() * 6) + 1);
        // Ease out: start fast (60ms), end slow (220ms)
        const delay = 60 + (step / steps) * 160;
        timerRef.current = setTimeout(cycle, delay);
      } else {
        setDisplayFace(face);
        onRollComplete?.();
      }
    }

    timerRef.current = setTimeout(cycle, 60);

    // Framer Motion tumble: rotateY spins fast, then slows; slight rotateX wobble
    controls.start({
      rotateY: [0, 150, 300, 450, 630, 720],
      rotateX: [0, -20, 15, -10, 5, 0],
      scale: [1, 1.08, 0.96, 1.04, 0.99, 1],
      transition: { duration: 1.45, ease: [0.25, 0.1, 0.25, 1] },
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rolling, face, controls, onRollComplete]);

  // When rolling resets (new game), reset the guard
  useEffect(() => {
    if (!rolling) startedRef.current = false;
  }, [rolling]);

  const dotSize = Math.round(size / 6);
  const dots = DOTS[displayFace] ?? [];

  return (
    <motion.div
      animate={controls}
      className="rounded-xl bg-cream shadow-md flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="w-full h-full grid grid-cols-3 grid-rows-3"
        style={{ padding: Math.round(size * 0.13) }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots.includes(i) && (
              <div
                className="rounded-full bg-casino-black"
                style={{ width: dotSize, height: dotSize }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
