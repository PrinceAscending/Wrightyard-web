export default function HeroRig() {
  return (
    <div className="hero__rig" aria-hidden="true">
      <svg viewBox="0 0 640 640" fill="none" stroke="currentColor">
        <g opacity="0.55">
          <circle cx="128" cy="128" r="68" strokeDasharray="1 8" />
          <path d="M128 44v28M128 184v28M44 128h28M184 128h28" />
          <circle cx="128" cy="128" r="3" fill="currentColor" stroke="none" />
        </g>

        <path d="M20 600h600" strokeDasharray="6 10" opacity="0.55" />

        <g strokeLinecap="square">
          <path d="M470 120v480M448 120h44" />
          <path d="M470 150H160M470 132H160M160 132v18" />
          <path d="M180 132l20 18 20-18 20 18 20-18 20 18 20-18 20 18 20-18 20 18 20-18 20 18 20-18" opacity="0.6" />
          <path d="M470 120 258 150M470 120 548 150" opacity="0.75" />
          <rect x="536" y="138" width="44" height="26" />
          <rect x="240" y="144" width="34" height="10" />
          <path d="M257 154v146" strokeDasharray="2 5" />
        </g>

        <g className="rig-hook">
          <path d="M257 300v14" />
          <path d="M257 314c0 22 38 22 38 0 0-13-18-15-18-1" />
          <rect x="232" y="332" width="50" height="7" />
        </g>

        <g className="rig-gear">
          <circle cx="470" cy="520" r="54" strokeWidth="9" strokeDasharray="7 11" />
          <circle cx="470" cy="520" r="38" />
          <circle cx="470" cy="520" r="15" />
          <path d="M470 482v-10M470 558v10M432 520h-10M508 520h10M443 493l-7-7M497 547l7 7M497 493l7-7M443 547l-7 7" />
        </g>

        <g opacity="0.45">
          <path d="M80 470h90M80 480h64M80 490h78" />
          <path d="M560 300v120M552 300h16M552 420h16" />
        </g>
      </svg>
    </div>
  );
}
