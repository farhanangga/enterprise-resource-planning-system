import type { ReactNode } from "react";

const tones = {
  orange: "bg-[#ff9d66]/25 text-[#1f1218]",
  brown: "bg-[#1f1218] text-white",
  red: "bg-[#c8362b]/10 text-[#9f2a20]",
  soft: "bg-[#1f1218]/[0.08] text-[#1f1218]",
} as const;

export type ChipTone = keyof typeof tones;

export default function Chip({ tone = "soft", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
