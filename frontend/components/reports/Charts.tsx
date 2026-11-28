"use client";

import { useEffect, useState } from "react";
import { idrShort } from "./helpers";

type Series = { name: string; color: string; values: number[] };

/** Grafik batang per bulan. Bulan di luar periode terpilih diredupkan. */
export function MonthlyBars({ labels, series, active, ariaLabel }: { labels: string[]; series: Series[]; active: number[]; ariaLabel: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const raw = Math.max(1, ...series.flatMap((s) => s.values));
  const step = 10 ** Math.floor(Math.log10(raw));
  const max = Math.ceil(raw / step) * step; // batas atas dibulatkan supaya sumbu enak dibaca
  const ticks = [1, 2 / 3, 1 / 3, 0].map((f) => max * f);

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="flex gap-3">
        <div className="flex h-48 flex-col justify-between pb-0 text-right text-[11px] font-semibold text-[#5d4a52]" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="leading-none">
              {idrShort(t)}
            </span>
          ))}
        </div>
        <div className="relative h-48 flex-1">
          {[0, 1, 2].map((i) => (
            <span key={i} aria-hidden className="absolute inset-x-0 border-t border-dashed border-[#1f1218]/10" style={{ top: `${i * 33.33}%` }} />
          ))}
          <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-[#1f1218]/15" />
          <div className="absolute inset-0 flex items-end justify-around gap-2">
            {labels.map((label, i) => (
              <div key={label} className={`group flex h-full flex-1 items-end justify-center gap-1 transition-opacity duration-300 ${active.includes(i) ? "opacity-100" : "opacity-35 hover:opacity-70"}`}>
                {series.map((s, k) => (
                  <div
                    key={s.name}
                    title={`${label} · ${s.name}: ${idrShort(s.values[i] ?? 0)}`}
                    className="w-full max-w-[22px] rounded-t-md transition-[height] duration-700 ease-out"
                    style={{ height: ready ? `${((s.values[i] ?? 0) / max) * 100}%` : "0%", backgroundColor: s.color, transitionDelay: `${i * 50 + k * 80}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-3">
        <span className="w-[52px] shrink-0" aria-hidden />
        <div className="flex flex-1 justify-around gap-2">
          {labels.map((l, i) => (
            <span key={l} className={`flex-1 text-center text-xs font-semibold ${active.includes(i) ? "text-[#1f1218]" : "text-[#5d4a52]"}`}>
              {l}
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-[#5d4a52]">
        {series.map((s) => (
          <li key={s.name} className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Daftar batang horizontal: label, angka, dan bar sebanding dengan nilai terbesar */
export function BarList({ items, dark = 0 }: { items: { label: string; sub?: string; value: number; text: string }[]; dark?: number }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="grid gap-4">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-semibold">
              {it.label}
              {it.sub && <span className="ml-2 text-xs font-normal text-[#5d4a52]">{it.sub}</span>}
            </span>
            <span className="shrink-0 font-bold tabular-nums">{it.text}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#1f1218]/10">
            <div className={`h-full rounded-full ${i < dark ? "bg-[#1f1218]" : "bg-[#ff9d66]"}`} style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
