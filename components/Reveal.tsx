"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  distance = 22,
}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { y: distance }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.72, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
