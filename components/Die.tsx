"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

// Dot positions on a 3×3 grid (indices 0–8, row-major)
const DOTS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// Container rotateX/rotateY to bring each face toward the viewer
const FACE_ROT: Record<number, [number, number]> = {
  1: [0, 0],      // front
  2: [0, -90],    // right
  3: [-90, 0],    // top
  4: [90, 0],     // bottom
  5: [0, 90],     // left
  6: [0, 180],    // back
};

interface Props {
  face: number;
  rolling: boolean;
  onRollComplete?: () => void;
  size?: number;
}

interface FaceProps {
  faceNum: number;
  half: number;
  dotSize: number;
}

function DieFace({ faceNum, half, dotSize }: FaceProps) {
  const dots = DOTS[faceNum] ?? [];

  // Position each face on the cube
  const transforms: Record<number, string> = {
    1: `translateZ(${half}px)`,
    2: `rotateY(90deg) translateZ(${half}px)`,
    3: `rotateX(90deg) translateZ(${half}px)`,
    4: `rotateX(-90deg) translateZ(${half}px)`,
    5: `rotateY(-90deg) translateZ(${half}px)`,
    6: `rotateY(180deg) translateZ(${half}px)`,
  };

  // Slightly varied lightness per face for depth illusion
  const bgColors: Record<number, string> = {
    1: "#f0ece4",
    2: "#e8e4dc",
    3: "#ece8e0",
    4: "#dedad2",
    5: "#e4e0d8",
    6: "#d8d4cc",
  };

  return (
    <div
      className="absolute inset-0 flex-shrink-0"
      style={{
        transform: transforms[faceNum],
        backfaceVisibility: "hidden",
        backgroundColor: bgColors[faceNum],
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="w-full h-full grid grid-cols-3 grid-rows-3"
        style={{ padding: Math.round((half * 2) * 0.13) }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots.includes(i) && (
              <div
                className="rounded-full bg-[#1a1a2e]"
                style={{ width: dotSize, height: dotSize }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Die({ face, rolling, onRollComplete, size = 72 }: Props) {
  const controls = useAnimation();
  const startedRef = useRef(false);
  const faceRef = useRef(face);
  const onRollCompleteRef = useRef(onRollComplete);
  const currentRotRef = useRef<[number, number]>([0, 0]);

  faceRef.current = face;
  onRollCompleteRef.current = onRollComplete;

  useEffect(() => {
    if (!rolling || startedRef.current) return;
    startedRef.current = true;

    const [initX, initY] = currentRotRef.current;
    const [tx, ty] = FACE_ROT[faceRef.current] ?? [0, 0];

    // Add full spins so the die tumbles visibly before landing on the target face
    const targetX = tx + initX - (initX % 360) + 1 * 360;
    const targetY = ty + initY - (initY % 360) + 2 * 360;

    currentRotRef.current = [tx, ty];

    controls
      .start({
        rotateX: targetX,
        rotateY: targetY,
        transition: { duration: 3.6, ease: [0.22, 1, 0.36, 1] },
      })
      .then(() => {
        onRollCompleteRef.current?.();
      });
  }, [rolling, controls]);

  // Reset guard when rolling finishes
  useEffect(() => {
    if (!rolling) startedRef.current = false;
  }, [rolling]);

  const half = size / 2;
  const dotSize = Math.round(size / 6);
  const [initX, initY] = FACE_ROT[face] ?? [0, 0];

  return (
    <div
      style={{
        width: size,
        height: size,
        perspective: size * 4,
        filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.55))",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={controls}
        initial={{ rotateX: initX, rotateY: initY }}
        style={{
          width: size,
          height: size,
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <DieFace key={n} faceNum={n} half={half} dotSize={dotSize} />
        ))}
      </motion.div>
    </div>
  );
}
