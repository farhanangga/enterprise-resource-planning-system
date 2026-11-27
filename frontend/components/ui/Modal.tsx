"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

export const fieldCls = (bad?: boolean) =>
  `h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none transition placeholder:text-[#5d4a52]/60 focus:ring-4 ${
    bad
      ? "border-[#c8362b] focus:ring-[#c8362b]/20"
      : "border-[#1f1218]/15 hover:border-[#1f1218]/30 focus:border-[#ff9d66] focus:ring-[#ff9d66]/25"
  }`;

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#1f1218] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218] disabled:pointer-events-none disabled:opacity-60";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#1f1218]/15 bg-white px-6 py-2.5 text-sm font-semibold transition-colors duration-200 hover:bg-[#ff9d66]/25";

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-[#5d4a52]">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#c8362b]">
          <Icon name="alert" className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function Modal({ title, onClose, size = "md", children }: { title: string; onClose: () => void; size?: "md" | "lg"; children: ReactNode }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        onClick={onClose}
        aria-hidden
        className={`absolute inset-0 bg-[#1f1218]/50 backdrop-blur-sm transition-opacity duration-300 ${entered ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`relative max-h-[90svh] w-full overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_40px_80px_-30px_rgba(31,18,24,.6)] transition-all duration-300 ${
          size === "lg" ? "max-w-2xl" : "max-w-lg"
        } ${entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:bg-[#ff9d66]/25"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
