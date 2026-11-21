import type { ReactNode } from "react";
import Reveal from "./Reveal";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1180px] ${className}`}>{children}</div>;
}

export function SectionHeading({
  title,
  lead,
  light = false,
  className = "",
}: {
  title: string;
  lead?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <Reveal className={`mb-10 max-w-[44rem] ${className}`}>
      <h2 className="text-[clamp(1.75rem,3.8vw,2.75rem)] font-black uppercase leading-[1.05] tracking-tight">{title}</h2>
      <span aria-hidden className="mt-4 block h-1.5 w-16 rounded-full bg-[#ff9d66]" />
      {lead && <p className={`mt-4 leading-relaxed ${light ? "text-[#e3cdd4]" : "text-[#5d4a52]"}`}>{lead}</p>}
    </Reveal>
  );
}
