"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnGhost } from "@/components/ui/Modal";

/* Potongan UI daftar yang dipakai halaman Purchasing (gaya sama dengan Sales) */

export function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-[#1f1218]/10 bg-white pl-4 pr-9 text-sm font-semibold outline-none transition hover:border-[#1f1218]/30 focus:border-[#ff9d66] focus:ring-4 focus:ring-[#ff9d66]/25"
      >
        {children}
      </select>
      <Icon name="chevron" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
    </label>
  );
}

export function SearchBox({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="group relative w-full sm:w-72">
      <span className="sr-only">{label}</span>
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5d4a52] transition-colors group-focus-within:text-[#e8641f]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-[#1f1218]/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#5d4a52]/60 focus:border-[#ff9d66] focus:ring-4 focus:ring-[#ff9d66]/25"
      />
    </label>
  );
}

export function Kpi({ icon, label, value, note }: { icon: IconName; label: string; value: string; note: string }) {
  return (
    <div className="group h-full rounded-[24px] border border-[#1f1218]/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9d66] hover:shadow-[0_18px_40px_-22px_rgba(255,157,102,.9)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff9d66]/25 transition-colors duration-300 group-hover:bg-[#ff9d66]">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#5d4a52]">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#5d4a52]">{note}</p>
    </div>
  );
}

export function Pager({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (n: number) => void }) {
  if (total === 0) return null;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, pages);
  const arrow =
    "grid h-9 w-9 place-items-center rounded-full border border-[#1f1218]/15 transition-colors duration-200 hover:bg-[#ff9d66]/30 disabled:pointer-events-none disabled:opacity-40";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1f1218]/10 px-4 py-3 text-sm sm:px-5">
      <p className="text-[#5d4a52]">
        Showing {(current - 1) * size + 1}–{Math.min(current * size, total)} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPage(current - 1)} disabled={current === 1} aria-label="Previous page" className={arrow}>
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === current ? "page" : undefined}
            className={`h-9 min-w-9 rounded-full px-3 text-xs font-bold transition-colors duration-200 ${n === current ? "bg-[#1f1218] text-white" : "hover:bg-[#ff9d66]/30"}`}
          >
            {n}
          </button>
        ))}
        <button type="button" onClick={() => onPage(current + 1)} disabled={current === pages} aria-label="Next page" className={arrow}>
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Empty({ title, text, onClear }: { title: string; text: string; onClear?: () => void }) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-[#5d4a52]">{text}</p>
      {onClear && (
        <button type="button" onClick={onClear} className={`${btnGhost} mt-4`}>
          Clear filters
        </button>
      )}
    </div>
  );
}
