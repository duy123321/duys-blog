import { useRef, useEffect } from 'react';

const INFLUENCE_RADIUS = 180;
const DAMPING = 0.97;
const VELOCITY_SCALE = 0.35;

interface ElementDef {
  id: string;
  type: 'windmill' | 'flower';
  x: number;       // % of container width (horizontal center of element)
  y: number;       // % of container height (bottom anchor of element)
  scale: number;
  stemHeight?: number;
}

// Positions are tuned so elements sit on the ground band (~78–88% from top)
const ELEMENTS: ElementDef[] = [
  { id: 'w1', type: 'windmill', x: 17,  y: 76, scale: 1.15 },
  { id: 'w2', type: 'windmill', x: 66,  y: 72, scale: 0.88 },
  { id: 'w3', type: 'windmill', x: 88,  y: 78, scale: 0.72 },
  { id: 'f1', type: 'flower',   x: 32,  y: 82, scale: 0.95, stemHeight: 52 },
  { id: 'f2', type: 'flower',   x: 44,  y: 85, scale: 0.78, stemHeight: 44 },
  { id: 'f3', type: 'flower',   x: 55,  y: 80, scale: 1.05, stemHeight: 56 },
  { id: 'f4', type: 'flower',   x: 78,  y: 84, scale: 0.82, stemHeight: 48 },
  { id: 'f5', type: 'flower',   x: 8,   y: 86, scale: 0.68, stemHeight: 40 },
  { id: 'f6', type: 'flower',   x: 50,  y: 88, scale: 0.60, stemHeight: 36 },
];

// ─── Windmill ───────────────────────────────────────────────────────────────
// SVG coordinate space: 60 wide × 130 tall
// Hub at (30, 28); tower widens from hub down to a base at y=124
function Windmill({ rotorRef }: { rotorRef: (el: SVGGElement | null) => void }) {
  return (
    <svg width="60" height="130" viewBox="0 0 60 130" overflow="visible" aria-hidden="true">
      {/* Tower body */}
      <polygon points="25,28 35,28 39,122 21,122" fill="#c8bfd4" />
      {/* Base plate */}
      <rect x="15" y="120" width="30" height="7" rx="2" fill="#b8afc4" />
      {/* Rotor: blades + hub — rotates as a group around (30, 28) */}
      <g
        ref={rotorRef}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        {/* Four blades offset by 90° each; each blade tapers from hub outward */}
        {[0, 90, 180, 270].map((angle) => (
          <g key={angle} transform={`rotate(${angle + 45} 30 28)`}>
            <path
              d="M30,28 L27,6 Q30,2 33,6 Z"
              fill="#e8d5f5"
              stroke="#aa3bff"
              strokeWidth="0.6"
            />
          </g>
        ))}
        {/* Hub cap */}
        <circle cx="30" cy="28" r="4.5" fill="#aa3bff" />
        <circle cx="30" cy="28" r="2"   fill="#f0e8ff" />
      </g>
    </svg>
  );
}

// ─── Flower ─────────────────────────────────────────────────────────────────
// Total SVG height = stemHeight + 56 (48 for head + 8 padding at bottom)
// Head center at (24, 24)
function Flower({
  rotorRef,
  stemHeight = 48,
}: {
  rotorRef: (el: SVGGElement | null) => void;
  stemHeight?: number;
}) {
  const headCY = 24;
  const totalHeight = stemHeight + 56;
  const stemTop = headCY + 14;
  const stemBot = totalHeight - 8;

  return (
    <svg
      width="48"
      height={totalHeight}
      viewBox={`0 0 48 ${totalHeight}`}
      overflow="visible"
      aria-hidden="true"
    >
      {/* Stem */}
      <line
        x1="24" y1={stemTop}
        x2="24" y2={stemBot}
        stroke="#6db06d"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left leaf */}
      <ellipse
        cx="17" cy={stemTop + stemHeight * 0.35}
        rx="9" ry="3.5"
        fill="#7dc87d"
        transform={`rotate(-35 17 ${stemTop + stemHeight * 0.35})`}
      />
      {/* Right leaf */}
      <ellipse
        cx="31" cy={stemTop + stemHeight * 0.6}
        rx="9" ry="3.5"
        fill="#7dc87d"
        transform={`rotate(35 31 ${stemTop + stemHeight * 0.6})`}
      />
      {/* Flower head — rotates as a group around (24, headCY) */}
      <g
        ref={rotorRef}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        {/* 6 petals spread evenly */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="24"
            cy={headCY - 11}
            rx="5.5"
            ry="11"
            fill="#f5b8dc"
            stroke="#e07ab8"
            strokeWidth="0.5"
            transform={`rotate(${angle} 24 ${headCY})`}
          />
        ))}
        {/* Center disc */}
        <circle cx="24" cy={headCY} r="7.5" fill="#f7d84a" stroke="#d4a820" strokeWidth="0.8" />
        {/* Subtle center dot */}
        <circle cx="24" cy={headCY} r="2.5" fill="#c8900a" opacity="0.4" />
      </g>
    </svg>
  );
}

// ─── WindScene ───────────────────────────────────────────────────────────────
export default function WindScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Map element id → the SVG <g> that should rotate
  const rotorRefs = useRef<Map<string, SVGGElement>>(new Map());
  // Map element id → physics state
  const physics = useRef<Map<string, { rotation: number; velocity: number }>>(new Map());
  // Last known cursor state (not in React state to avoid re-renders)
  const cursor = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });
  const rafId = useRef(0);

  // Stable ref-setter factory — one per element id
  const makeRotorRef = (id: string) => (el: SVGGElement | null) => {
    if (el) rotorRefs.current.set(id, el);
    else rotorRefs.current.delete(id);
  };

  useEffect(() => {
    // Initialize physics
    for (const el of ELEMENTS) {
      physics.current.set(el.id, { rotation: 0, velocity: 0 });
    }

    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - cursor.current.lastX;
      const dy = y - cursor.current.lastY;
      cursor.current.lastX = cursor.current.x;
      cursor.current.lastY = cursor.current.y;
      cursor.current.x = x;
      cursor.current.y = y;

      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed === 0) return;

      for (const el of ELEMENTS) {
        const ex = (el.x / 100) * rect.width;
        const ey = (el.y / 100) * rect.height;
        const dist = Math.sqrt((x - ex) ** 2 + (y - ey) ** 2);
        if (dist >= INFLUENCE_RADIUS) continue;

        const influence = 1 - dist / INFLUENCE_RADIUS;
        const state = physics.current.get(el.id)!;
        // Cross product of cursor velocity × (element → cursor) gives spin direction
        const cross = dx * (ey - y) - dy * (ex - x);
        const sign = cross >= 0 ? 1 : -1;
        state.velocity += sign * speed * VELOCITY_SCALE * influence;
      }
    };

    const animate = () => {
      for (const el of ELEMENTS) {
        const state = physics.current.get(el.id);
        const rotor = rotorRefs.current.get(el.id);
        if (!state || !rotor) continue;
        state.velocity *= DAMPING;
        state.rotation += state.velocity;
        rotor.style.transform = `rotate(${state.rotation}deg)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    container.addEventListener('mousemove', onMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '70vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ede6f7 0%, #f5f0fb 45%, #fafaf9 75%)',
        cursor: 'crosshair',
      }}
    >
      {/* Ground band */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '24%',
          background: 'linear-gradient(180deg, #dff0df 0%, #c8e4c8 100%)',
          borderRadius: '50% 50% 0 0 / 18px 18px 0 0',
        }}
      />

      {/* Scene elements */}
      {ELEMENTS.map((el) => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: `translate(-50%, -100%) scale(${el.scale})`,
            transformOrigin: 'bottom center',
          }}
        >
          {el.type === 'windmill' ? (
            <Windmill rotorRef={makeRotorRef(el.id)} />
          ) : (
            <Flower rotorRef={makeRotorRef(el.id)} stemHeight={el.stemHeight} />
          )}
        </div>
      ))}
    </div>
  );
}
