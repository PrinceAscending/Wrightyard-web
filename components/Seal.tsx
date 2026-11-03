"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function Seal() {
  const [pressed, setPressed] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className={`seal-wrap${pressed ? " is-pressed" : ""}`}>
      <motion.button
        type="button"
        className="seal"
        aria-pressed={pressed}
        aria-label={pressed ? "Wrightyard seal, pressed" : "Press the Wrightyard seal"}
        onClick={() => setPressed(true)}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        animate={pressed && !reduce ? { rotate: -3, scale: 1.02 } : undefined}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
      >
        <span className="seal__impression" aria-hidden="true" />
        <svg viewBox="0 0 200 200" role="presentation" aria-hidden="true">
          <defs>
            <path id="seal-top" d="M 100,100 m -76,0 a 76,76 0 1,1 152,0" />
            <path id="seal-bottom" d="M 100,100 m -76,0 a 76,76 0 1,0 152,0" />
          </defs>

          <circle className="seal__ring" cx="100" cy="100" r="96" />
          <circle className="seal__ring seal__ring--thin" cx="100" cy="100" r="86" />
          <circle className="seal__ring seal__ring--dots" cx="100" cy="100" r="79" />

          <text className="seal__arc">
            <textPath href="#seal-top" startOffset="50%" textAnchor="middle">
              WRIGHTYARD · SOFTWARE &amp; AFTER HOURS ·
            </textPath>
          </text>
          <text className="seal__arc seal__arc--bottom">
            <textPath href="#seal-bottom" startOffset="50%" textAnchor="middle">
              EST. 2026 · THE YARD IS OPEN ·
            </textPath>
          </text>

          <path className="seal__keel" d="M65 78 82 123 100 92 118 123 135 78" />
          <rect className="seal__chip" x="64" y="128" width="10" height="10" />

          <text className="seal__prompt" x="100" y="142" textAnchor="middle">
            {pressed ? "OPEN" : "PRESS"}
          </text>
        </svg>
      </motion.button>
      <p className="seal-wrap__status" aria-live="polite">
        {pressed ? "The yard is open. Bring us the thing." : "Press the seal."}
      </p>
    </div>
  );
}
