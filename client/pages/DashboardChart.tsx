import React from "react";

function genPoints(count: number, seed = 1, min = 1000, max = 5000) {
  const pts: number[] = [];
  let v = seed;
  for (let i = 0; i < count; i++) {
    v = Math.abs((v * 9301 + 49297) % 233280);
    const norm = v / 233280;
    pts.push(Math.round(min + norm * (max - min)));
  }
  return pts;
}

export default function SVGChart({ range, leaders }: { range: "day" | "week" | "month"; leaders: any[] }) {
  const count = range === "day" ? 24 : range === "week" ? 7 : 30;
  const data = genPoints(count, 42, 1000, 8000);
  const w = 800;
  const h = 160;
  const max = Math.max(...data) || 1;
  const stepX = w / (data.length - 1 || 1);
  const points = data.map((v, i) => `${i * stepX},${h - (v / max) * (h - 20)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0.16)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="rgba(99,102,241,0.9)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`${points} ${w},${h} 0,${h}`} fill="url(#g)" opacity={0.6} />
    </svg>
  );
}
