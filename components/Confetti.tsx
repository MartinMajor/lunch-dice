"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SUITS = ["♠", "♦", "♣", "♥"];
const COLORS = ["#c9a84c", "#e8c96a", "#f5f0e8", "#cc2222"];

interface Particle {
  id: number;
  suit: string;
  color: string;
  left: number;   // % from left
  delay: number;
  duration: number;
  rotate: number;
  size: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: 36 }, (_, i) => ({
    id: i,
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 1.8 + Math.random() * 1.4,
    rotate: (Math.random() - 0.5) * 900,
    size: 14 + Math.floor(Math.random() * 14),
  }));
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles());
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute select-none"
          style={{ left: `${p.left}%`, color: p.color, fontSize: p.size }}
          initial={{ top: "-6%", opacity: 1, rotate: 0 }}
          animate={{ top: "108%", opacity: [1, 1, 1, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        >
          {p.suit}
        </motion.span>
      ))}
    </div>
  );
}
