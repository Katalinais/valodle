"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#ff4655", "#ece8e1", "#3fa34d", "#ffb547", "#ff8a95"];

/** Estallido de partículas (tipo confeti) desde el centro. Decorativo. */
export function Celebration({ count = 28 }: { count?: number }) {
  const reduce = useReducedMotion();
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 90 + ((i * 37) % 70);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist * 0.7 - 20,
          rotate: (i * 47) % 360,
          color: COLORS[i % COLORS.length],
          size: 5 + (i % 3) * 2,
          square: i % 2 === 0,
        };
      }),
    [count],
  );
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-16 h-0 w-0">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{
            width: p.size,
            height: p.square ? p.size : p.size * 2.2,
            background: p.color,
            borderRadius: p.square ? 2 : 999,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{
            x: p.x,
            y: [0, p.y, p.y + 60],
            opacity: [1, 1, 0],
            rotate: p.rotate + 180,
            scale: 1,
          }}
          transition={{ duration: 1.4, ease: "easeOut", times: [0, 0.55, 1] }}
        />
      ))}
    </div>
  );
}
