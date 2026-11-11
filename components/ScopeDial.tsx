"use client";

import { useState } from "react";

const factors = [
  { name: "Scope", note: "One bot or a whole system.", angle: -67.5 },
  { name: "Integrations", note: "Payments, APIs, dashboards.", angle: -22.5 },
  { name: "Hosting", note: "Managed or handoff.", angle: 22.5 },
  { name: "Timeline", note: "Standard or expedited.", angle: 67.5 },
];

function polar(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 160 + Math.sin(radians) * radius,
    y: 158 - Math.cos(radians) * radius,
  };
}

function arc(start: number, end: number, radius: number) {
  const from = polar(start, radius);
  const to = polar(end, radius);
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

const ticks = Array.from({ length: 13 }, (_, index) => -90 + index * 15);

export default function ScopeDial() {
  const [active, setActive] = useState(0);
  const factor = factors[active];

  return (
    <div className="dial">
      <div className="dial__head">
        <p className="dial__label">Four things move the number</p>
        <span className="dial__code">Estimate / 01</span>
      </div>

      <div className="dial__stage">
        <svg viewBox="0 0 320 200" fill="none" aria-hidden="true">
          <path d="M42 158 A118 118 0 0 1 278 158" stroke="var(--line-strong)" />
          {ticks.map((tick) => {
            const inner = polar(tick, 118);
            const outer = polar(tick, tick % 45 === 0 ? 132 : 126);
            return (
              <line
                key={tick}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--line-strong)"
                opacity={tick % 45 === 0 ? 0.9 : 0.45}
              />
            );
          })}
          <path
            d={arc(factor.angle - 8, factor.angle + 8, 118)}
            stroke="var(--red)"
            strokeWidth="5"
          />
          <g
            className="dial__needle"
            style={{ transform: `rotate(${factor.angle}deg)` }}
          >
            <path d="M160 158V58" stroke="var(--ink)" />
            <path d="M160 48l-5 12h10z" fill="var(--red)" />
          </g>
          <circle cx="160" cy="158" r="7" fill="var(--ink)" />
          <circle cx="160" cy="158" r="2.5" fill="var(--paper)" />
          <text x="42" y="178" className="dial__scale" textAnchor="middle">01</text>
          <text x="278" y="178" className="dial__scale" textAnchor="middle">04</text>
        </svg>

        <div className="dial__readout" aria-live="polite">
          <span className="dial__readout-name">{factor.name}</span>
          <span className="dial__readout-note">{factor.note}</span>
        </div>
      </div>

      <div className="dial__buttons" role="group" aria-label="Things that move the number">
        {factors.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={active === index}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
          >
            {item.name}
          </button>
        ))}
      </div>

      <p className="dial__foot">
        If the scope changes, the quote changes first.
      </p>
    </div>
  );
}
