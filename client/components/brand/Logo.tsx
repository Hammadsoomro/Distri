import * as React from "react";
import { cn } from "@/lib/utils";

export function TeamWorkLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("stroke-current", className)}
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Three people in a circle representing teamwork */}
      <circle cx="24" cy="24" r="20" className="opacity-20" />
      {/* Top person */}
      <circle cx="24" cy="16" r="4" />
      <path d="M16 26c2.5-4 13.5-4 16 0" />
      {/* Left person */}
      <circle cx="14" cy="24" r="3.5" />
      <path d="M8 32c1.5-3 8.5-3 10 0" />
      {/* Right person */}
      <circle cx="34" cy="24" r="3.5" />
      <path d="M30 32c1.5-3 8.5-3 10 0" />
      {/* Connectors */}
      <path d="M18 18 L14 20" className="opacity-70" />
      <path d="M30 18 L34 20" className="opacity-70" />
    </svg>
  );
}

export default TeamWorkLogo;
