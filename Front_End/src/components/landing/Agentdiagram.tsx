"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type gsap from "gsap";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BLUE  = "#6366f1";
const RED   = "#f87171";
const GREEN = "#34d399";

// ─── Canvas ───────────────────────────────────────────────────────────────────
const W  = 1000;
const CX = W / 2; // 500

const ENTRY_Y  = 24;
const ENTRY_H  = 48;
const CARD_Y   = 148;
const CARD_W   = 240;
const CARD_H   = 200;
const CARD_BOT = CARD_Y + CARD_H; // 348
const RES_Y    = 430;
const RES_H    = 180;
const PILLS_Y  = 660;
const STATS_Y  = 706;
const H        = STATS_Y + 48; // 754

// Card centres
const C_LEFT  = 215;
const C_MID   = CX;       // 500
const C_RIGHT = 785;

// Card top-left X
const X_LEFT  = C_LEFT  - CARD_W / 2; // 95
const X_MID   = C_MID   - CARD_W / 2; // 380
const X_RIGHT = C_RIGHT - CARD_W / 2; // 665

// Resource box: width=130 → x=435
const RES_X = CX - 65;

// Fan convergence
const J_Y = CARD_Y - 18; // 130

// Paths
const PATH = {
  entryToLeft:  `M ${CX} ${ENTRY_Y + ENTRY_H} C ${CX} ${J_Y}, ${C_LEFT}  ${J_Y}, ${C_LEFT}  ${CARD_Y}`,
  entryToMid:   `M ${CX} ${ENTRY_Y + ENTRY_H} L ${CX} ${CARD_Y}`,
  entryToRight: `M ${CX} ${ENTRY_Y + ENTRY_H} C ${CX} ${J_Y}, ${C_RIGHT} ${J_Y}, ${C_RIGHT} ${CARD_Y}`,
  leftToRes:    `M ${C_LEFT}  ${CARD_BOT} C ${C_LEFT}  ${RES_Y - 40}, ${CX} ${RES_Y - 40}, ${CX} ${RES_Y}`,
  midToRes:     `M ${C_MID}   ${CARD_BOT} L ${CX} ${RES_Y}`,
  rightToRes:   `M ${C_RIGHT} ${CARD_BOT} C ${C_RIGHT} ${RES_Y - 40}, ${CX} ${RES_Y - 40}, ${CX} ${RES_Y}`,
} as const;

// ─── Theme ────────────────────────────────────────────────────────────────────
function useT() {
  const { resolvedTheme } = useTheme();
  const d = resolvedTheme !== "light";
  return {
    dark:      d,
    bg:        d ? "#0a0a0a"                : "#f0ede8",
    cardBg:    d ? "#1a1a1a"               : "#ffffff",
    cardSt:    d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    textPri:   d ? "#f0f0ef"               : "#1a1a18",
    textMut:   d ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
    textDim:   d ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)",
    line:      d ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.12)",
    div:       d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    pillBg:    d ? "#222222"               : "#ffffff",
    pillSt:    d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    entryBg:   d ? "#1a1a1a"               : "#ffffff",
    entrySt:   d ? "rgba(255,255,255,0.1)"  : "rgba(0,0,0,0.1)",
  } as const;
}
type Tok = ReturnType<typeof useT>;

// ─── Glow filter ──────────────────────────────────────────────────────────────
function GlowF({ id, std = 4 }: { id: string; std?: number }) {
  return (
    <filter id={id} x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={std} result="b" />
      <feComposite in="b" in2="SourceGraphic" operator="over" />
    </filter>
  );
}

// ─── Moving dot ───────────────────────────────────────────────────────────────
function Dot({ pid, color, delay = 0, dur = 2.2, gid }: {
  pid: string; color: string; delay?: number; dur?: number; gid: string;
}) {
  const ref = useRef<SVGCircleElement>(null);
  useLayoutEffect(() => {
    let tw: gsap.core.Tween | null = null;
    (async () => {
      const { gsap }             = await import("gsap");
      const { MotionPathPlugin } = await import("gsap/MotionPathPlugin");
      gsap.registerPlugin(MotionPathPlugin);
      if (!ref.current) return;
      tw = gsap.to(ref.current, {
        motionPath: {
          path: `#${pid}`, align: `#${pid}`,
          autoRotate: false, start: 0, end: 1,
        },
        duration: dur, delay, repeat: -1, ease: "none", immediateRender: false,
      });
    })();
    return () => { tw?.kill(); };
  }, [pid, delay, dur]);
  return <circle ref={ref} r="4" fill={color} filter={`url(#${gid})`} opacity="0.9" />;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ id, x, y, dot, border, ws, type, title, detail, badge, bc, t }: {
  id: string; x: number; y: number;
  dot: string; border: string;
  ws: string; type: string;
  title: string; detail: string;
  badge: string; bc: string;
  t: Tok;
}) {
  const W = CARD_W;
  const H = CARD_H;
  return (
    <g id={id} transform={`translate(${x},${y})`}>
      {/* Dashed outer border */}
      <rect width={W + 20} height={H + 20} rx="20"
        fill="none"
        stroke={border} strokeWidth="1"
        strokeDasharray="5 4"
        opacity="0.45" />

      {/* Card body */}
      <rect x="10" y="10" width={W} height={H} rx="16"
        fill={t.cardBg} stroke={t.cardSt} strokeWidth="0.8"
        style={{ transition: "fill 0.3s" }} />

      {/* Status row */}
      <circle cx="32" cy="34" r="5"   fill={dot} />
      <circle cx="32" cy="34" r="9.5" fill={dot} opacity="0.15" />
      <text x="46" y="39" fill={t.textMut}
        fontSize="12" fontWeight="600" fontFamily="'Syne',sans-serif">{ws}</text>
      <text x={W + 8} y="39" fill={t.textDim}
        fontSize="11" fontFamily="'Syne',sans-serif" textAnchor="end">Running</text>

      {/* Divider */}
      <line x1="10" y1="52" x2={W + 10} y2="52" stroke={t.div} strokeWidth="0.8" />

      {/* Type */}
      <text x="24" y="74" fill={t.textDim} fontSize="9"
        letterSpacing="2.5" fontFamily="'Syne',sans-serif">{type}</text>

      {/* Title */}
      <text x="24" y="100" fill={t.textPri} fontSize="18" fontWeight="700"
        fontFamily="'Syne',sans-serif" letterSpacing="-0.3">{title}</text>

      {/* Detail */}
      <text x="24" y="120" fill={t.textMut} fontSize="11.5"
        fontFamily="'Syne',sans-serif">{detail}</text>

      {/* Badge */}
      <rect x="24" y="134" width="80" height="24" rx="12"
        fill={`${bc}18`} stroke={`${bc}30`} strokeWidth="0.8" />
      <text x="64" y="150" fill={bc} fontSize="11.5" fontWeight="700"
        fontFamily="'Syne',sans-serif" textAnchor="middle">{badge}</text>

      {/* Shield */}
      <g transform={`translate(${W - 18}, 132)`} opacity="0.35">
        <path d="M8 1L2 4v4.5C2 12 4.5 14.5 8 16c3.5-1.5 6-4 6-7.5V4L8 1z"
          fill="none" stroke={GREEN} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M5 8l2 2 4-4" stroke={GREEN} strokeWidth="1.2"
          strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </g>
  );
}

// ─── Resource box ─────────────────────────────────────────────────────────────
function ResBox({ x, y, t }: { x: number; y: number; t: Tok }) {
  const items = [
    { label: "Kernel",  color: RED   },
    { label: "Storage", color: BLUE  },
    { label: "Network", color: GREEN },
  ];
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Dashed border */}
      <rect width="150" height={RES_H} rx="20"
        fill="none"
        stroke={t.line} strokeWidth="0.8"
        strokeDasharray="5 4" opacity="0.7" />

      <rect x="8" y="8" width="134" height={RES_H - 16} rx="14"
        fill={t.cardBg} stroke={t.cardSt} strokeWidth="0.8"
        style={{ transition: "fill 0.3s" }} />

      {/* Lock icon */}
      <g transform="translate(75, 32)">
        <rect x="-14" y="-2" width="28" height="22" rx="5"
          fill="none" stroke={t.textDim} strokeWidth="1.3" />
        <path d="M-8 -2 v-7 a8 8 0 0 1 16 0 v7"
          fill="none" stroke={t.textDim} strokeWidth="1.3"
          strokeLinecap="round" />
        <circle cx="0" cy="9" r="2.5" fill={t.textDim} />
      </g>

      {items.map((item, i) => (
        <g key={item.label} transform={`translate(17, ${72 + i * 30})`}>
          <rect width="116" height="24" rx="12"
            fill={t.pillBg} stroke={t.pillSt} strokeWidth="0.8" />
          <text x="58" y="16.5" fill={t.textMut} fontSize="11"
            fontWeight="600" fontFamily="'Syne',sans-serif" textAnchor="middle">
            {item.label}
          </text>
        </g>
      ))}

      <text x="75" y={RES_H - 8} fill={t.textDim} fontSize="8.5"
        letterSpacing="2" fontFamily="'Syne',sans-serif" textAnchor="middle">
        PER WORKSPACE
      </text>
    </g>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function Pill({ x, y, color, label, t }: {
  x: number; y: number; color: string; label: string; t: Tok;
}) {
  const w = label.length * 7 + 54;
  return (
    <g transform={`translate(${x - w / 2},${y})`}>
      <rect width={w} height="32" rx="16"
        fill={t.pillBg} stroke={t.pillSt} strokeWidth="0.8" />
      <circle cx="20" cy="16" r="4.5" fill={color} />
      <circle cx="20" cy="16" r="8"   fill={color} opacity="0.12" />
      <text x="33" y="21" fill={t.textMut} fontSize="12"
        fontWeight="600" fontFamily="'Syne',sans-serif">{label}</text>
    </g>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────
function Stat({ x, y, label, value, t }: {
  x: number; y: number; label: string; value: string; t: Tok;
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x="0" y="0" fill={t.textDim} fontSize="9.5"
        letterSpacing="2.5" fontFamily="'Syne',sans-serif" textAnchor="middle">
        {label}
      </text>
      <text x="0" y="26" fill={t.textPri} fontSize="22" fontWeight="800"
        letterSpacing="-0.5" fontFamily="'Syne',sans-serif" textAnchor="middle">
        {value}
      </text>
    </g>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AgentWorkflow() {
  const uid    = useId().replace(/:/g, "-");
  const t      = useT();
  const svgRef = useRef<SVGSVGElement>(null);

  const ids = {
    mp: {
      el: `mp-el-${uid}`, em: `mp-em-${uid}`, er: `mp-er-${uid}`,
      lr: `mp-lr-${uid}`, mr: `mp-mr-${uid}`, rr: `mp-rr-${uid}`,
    },
    ln: {
      el: `ln-el-${uid}`, em: `ln-em-${uid}`, er: `ln-er-${uid}`,
      lr: `ln-lr-${uid}`, mr: `ln-mr-${uid}`, rr: `ln-rr-${uid}`,
    },
    gl: { b: `gb-${uid}`, r: `gr-${uid}`, g: `gg-${uid}` },
    entry: `en-${uid}`,
    cL: `cL-${uid}`, cM: `cM-${uid}`, cR: `cR-${uid}`,
    res:   `rs-${uid}`,
    pills: `pl-${uid}`,
    stats: `st-${uid}`,
  } as const;

  // GSAP — scroll reveal + line draw only, no mouse effects
  useLayoutEffect(() => {
    let ctx: gsap.Context;
    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (!svgRef.current) return;

      ctx = gsap.context(() => {
        const trig = { trigger: svgRef.current, start: "top 80%", once: true };

        // Entry pop
        gsap.from(`#${ids.entry}`, {
          opacity: 0, scale: 0.9, transformOrigin: "center center",
          duration: 0.45, ease: "back.out(1.6)", scrollTrigger: trig,
        });

        // Cards stagger
        gsap.from([ids.cL, ids.cM, ids.cR, ids.res].map(i => `#${i}`), {
          opacity: 0, y: 20, stagger: 0.1, duration: 0.6,
          ease: "power3.out", delay: 0.12, scrollTrigger: trig,
        });

        // Line draw
        Object.values(ids.ln).forEach((lid, i) => {
          const el = svgRef.current?.querySelector(`#${lid}`) as SVGPathElement | null;
          if (!el) return;
          const len = el.getTotalLength?.() ?? 250;
          gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(el, {
            strokeDashoffset: 0, duration: 0.7,
            delay: 0.05 + i * 0.09, ease: "power2.inOut", scrollTrigger: trig,
          });
        });

        // Pills & stats
        gsap.from([`#${ids.pills}`, `#${ids.stats}`], {
          opacity: 0, y: 10, stagger: 0.08, duration: 0.5, delay: 0.4,
          ease: "power3.out",
          scrollTrigger: { trigger: svgRef.current, start: "top 70%", once: true },
        });
      }, svgRef);
    })();
    return () => { ctx?.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex justify-center px-4 py-10">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[960px] h-auto overflow-visible"
        role="img"
        aria-label="Agent workflow diagram"
      >
        <defs>
          <GlowF id={ids.gl.b} std={5} />
          <GlowF id={ids.gl.r} std={5} />
          <GlowF id={ids.gl.g} std={5} />
        </defs>

        {/* ── Hidden motion paths ──────────────────────── */}
        <path id={ids.mp.el} d={PATH.entryToLeft}  fill="none" stroke="none" />
        <path id={ids.mp.em} d={PATH.entryToMid}   fill="none" stroke="none" />
        <path id={ids.mp.er} d={PATH.entryToRight} fill="none" stroke="none" />
        <path id={ids.mp.lr} d={PATH.leftToRes}    fill="none" stroke="none" />
        <path id={ids.mp.mr} d={PATH.midToRes}     fill="none" stroke="none" />
        <path id={ids.mp.rr} d={PATH.rightToRes}   fill="none" stroke="none" />

        {/* ── Static dashed connectors ─────────────────── */}
        <path d={PATH.entryToLeft}  stroke={t.line} strokeWidth="1" strokeDasharray="4 5" />
        <path d={PATH.entryToMid}   stroke={t.line} strokeWidth="1" strokeDasharray="4 5" />
        <path d={PATH.entryToRight} stroke={t.line} strokeWidth="1" strokeDasharray="4 5" />
        <path d={PATH.leftToRes}    stroke={t.line} strokeWidth="1" strokeDasharray="4 5" />
        <path d={PATH.midToRes}     stroke={t.line} strokeWidth="1" strokeDasharray="4 5" opacity="0.6" />
        <path d={PATH.rightToRes}   stroke={t.line} strokeWidth="1" strokeDasharray="4 5" />

        {/* ── Animated reveal lines ────────────────────── */}
        <path id={ids.ln.el} d={PATH.entryToLeft}  stroke={RED}   strokeWidth="1.5" opacity="0.45" />
        <path id={ids.ln.em} d={PATH.entryToMid}   stroke={BLUE}  strokeWidth="1.5" opacity="0.45" />
        <path id={ids.ln.er} d={PATH.entryToRight} stroke={GREEN} strokeWidth="1.5" opacity="0.45" />
        <path id={ids.ln.lr} d={PATH.leftToRes}    stroke={RED}   strokeWidth="1.5" opacity="0.38" />
        <path id={ids.ln.mr} d={PATH.midToRes}     stroke={BLUE}  strokeWidth="1.2" opacity="0.3" />
        <path id={ids.ln.rr} d={PATH.rightToRes}   stroke={GREEN} strokeWidth="1.5" opacity="0.38" />

        {/* ── Junction dots (static, glowing) ─────────── */}
        <circle cx={C_LEFT}  cy={CARD_Y + CARD_H / 2 - 20} r="5.5" fill={RED}   filter={`url(#${ids.gl.r})`} opacity="0.85" />
        <circle cx={C_RIGHT} cy={CARD_Y + CARD_H / 2 - 20} r="5.5" fill={GREEN} filter={`url(#${ids.gl.g})`} opacity="0.85" />

        {/* ── Moving dots ──────────────────────────────── */}
        <Dot pid={ids.mp.el} color={RED}   delay={0}    dur={2.0} gid={ids.gl.r} />
        <Dot pid={ids.mp.el} color={RED}   delay={1.0}  dur={2.0} gid={ids.gl.r} />
        <Dot pid={ids.mp.em} color={BLUE}  delay={0.3}  dur={1.7} gid={ids.gl.b} />
        <Dot pid={ids.mp.em} color={BLUE}  delay={1.15} dur={1.7} gid={ids.gl.b} />
        <Dot pid={ids.mp.er} color={GREEN} delay={0.65} dur={2.0} gid={ids.gl.g} />
        <Dot pid={ids.mp.er} color={GREEN} delay={1.65} dur={2.0} gid={ids.gl.g} />
        <Dot pid={ids.mp.lr} color={RED}   delay={1.2}  dur={2.0} gid={ids.gl.r} />
        <Dot pid={ids.mp.mr} color={BLUE}  delay={1.4}  dur={1.7} gid={ids.gl.b} />
        <Dot pid={ids.mp.rr} color={GREEN} delay={1.85} dur={2.0} gid={ids.gl.g} />

        {/* ── Entry node ───────────────────────────────── */}
        <g id={ids.entry}>
          <rect x={CX - 160} y={ENTRY_Y} width="320" height={ENTRY_H} rx="24"
            fill={t.entryBg} stroke={t.entrySt} strokeWidth="0.8"
            style={{ transition: "fill 0.3s" }} />
          <circle cx={CX - 128} cy={ENTRY_Y + 24} r="6"
            fill={RED} filter={`url(#${ids.gl.r})`} />
          <circle cx={CX - 128} cy={ENTRY_Y + 24} r="11"
            fill={RED} opacity="0.12" />
          <text x={CX - 110} y={ENTRY_Y + 29}
            fill={t.textMut} fontSize="14" fontWeight="600"
            fontFamily="'Syne',sans-serif">
            AgentLab.create()
          </text>
        </g>

        {/* ── 3 Cards ──────────────────────────────────── */}
        <Card id={ids.cL} x={X_LEFT}  y={CARD_Y}
          dot={RED}   border={RED}
          ws="ws-7f3a"       type="SERVICE"
          title="API Server"   detail="4 vCPU · 8 GB"
          badge="42d UP"     bc={RED}   t={t} />

        <Card id={ids.cM} x={X_MID}   y={CARD_Y}
          dot={BLUE}  border={BLUE}
          ws="ws-2b1c"       type="AGENT"
          title="Code Agent"   detail="2 vCPU · 4 GB"
          badge="112ms"      bc={BLUE}  t={t} />

        <Card id={ids.cR} x={X_RIGHT} y={CARD_Y}
          dot={GREEN} border={GREEN}
          ws="ws-9d4e"       type="DEV ENV"
          title="Staging"      detail="4 vCPU · 8 GB"
          badge="127ms"      bc={GREEN} t={t} />

        {/* ── Resource box ─────────────────────────────── */}
        <g id={ids.res}>
          <ResBox x={RES_X} y={RES_Y} t={t} />
        </g>

        {/* ── Feature pills ────────────────────────────── */}
        <g id={ids.pills}>
          <Pill x={200}  y={PILLS_Y} color={RED}   label="Full Root"                   t={t} />
          <Pill x={CX}   y={PILLS_Y} color={BLUE}  label="Isolated Network per Workspace" t={t} />
          <Pill x={800}  y={PILLS_Y} color={GREEN} label="Auto Teardown"               t={t} />
        </g>

        {/* ── Stats ────────────────────────────────────── */}
        <g id={ids.stats}>
          <Stat x={200}  y={STATS_Y} label="AVG BOOT"   value="111ms"   t={t} />
          <Stat x={CX}   y={STATS_Y} label="ENCRYPTION" value="AES-256" t={t} />
          <Stat x={800}  y={STATS_Y} label="UPTIME"     value="99.9%"   t={t} />
        </g>
      </svg>
    </div>
  );
}