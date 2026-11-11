"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

const steps = [
  {
    number: "01",
    name: "Brief",
    when: "Day 0",
    body: "Bring the problem. We ask the questions a form cannot.",
  },
  {
    number: "02",
    name: "Scope",
    when: "Day 1–2",
    body: "The build, the price, and the date, written down before work starts.",
  },
  {
    number: "03",
    name: "Build",
    when: "In build",
    body: "Small visible steps. You see the work as it happens.",
  },
  {
    number: "04",
    name: "Keep",
    when: "After launch",
    body: "Docs and handoff, or we stay on the line and run it.",
  },
];

export default function ProcessRail() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.55"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const carriageTop = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <div className="rail" ref={ref}>
      <div className="rail__line" aria-hidden="true">
        <motion.span
          className="rail__fill"
          style={{ scaleY: reduce ? 1 : progress }}
        />
        <motion.span
          className="rail__carriage"
          style={{ top: reduce ? "100%" : carriageTop }}
        />
      </div>

      <ol className="rail__steps">
        {steps.map((step, index) => (
          <motion.li
            className="rail__step"
            key={step.number}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.55,
              delay: index * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <span className="rail__node" aria-hidden="true" />
            <span className="rail__meta">
              <span>{step.number}</span>
              <em>{step.when}</em>
            </span>
            <h3>{step.name}</h3>
            <p>{step.body}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
