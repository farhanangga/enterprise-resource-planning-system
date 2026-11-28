import type { Delta, Period, ReportData, ReportProduct } from "./types";

export const idr = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;

/** Singkat untuk sumbu grafik, mis. "Rp 45 jt" */
export function idrShort(n: number) {
  if (n >= 1_000_000_000) return `Rp ${+(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000) return `Rp ${+(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)} jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`;
  return `Rp ${Math.round(n)}`;
}

export const num = (n: number) => new Intl.NumberFormat("id-ID").format(Math.round(n));
export const pct = (n: number, digits = 1) => `${n.toFixed(digits).replace(".", ",")}%`;

export const monthShort = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-GB", { month: "short" });
export const monthLong = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

/* ---------- periode ---------- */
export const periodLabel: Record<Period, string> = { month: "This month", "3m": "Last 3 months", "6m": "Last 6 months" };
const periodLen: Record<Period, number> = { month: 1, "3m": 3, "6m": 6 };

/** Indeks bulan yang dipilih dan periode pembanding sebelumnya (null bila datanya tidak cukup) */
export function periodRange(period: Period, months: string[]) {
  const len = Math.min(periodLen[period], months.length);
  const idx = months.map((_, i) => i).slice(months.length - len);
  const start = months.length - len;
  const prev = start - len >= 0 ? months.map((_, i) => i).slice(start - len, start) : null;
  return { idx, prev };
}

export function rangeLabel(period: Period, months: string[]) {
  const { idx } = periodRange(period, months);
  const first = months[idx[0]!]!;
  const last = months[idx[idx.length - 1]!]!;
  return first === last ? monthLong(last) : `${monthShort(first)} – ${monthShort(last)} ${last.slice(0, 4)}`;
}

export function prevLabel(period: Period, months: string[]) {
  const { prev } = periodRange(period, months);
  if (!prev) return "";
  return prev.length === 1 ? `vs ${monthShort(months[prev[0]!]!)}` : `vs previous ${prev.length} months`;
}

export const sum = (arr: number[], idx: number[]) => idx.reduce((s, i) => s + (arr[i] ?? 0), 0);

export function delta(cur: number, prev: number | null, label: string): Delta {
  if (prev === null || prev === 0) return null;
  return { pct: ((cur - prev) / prev) * 100, label };
}

export const deltaText = (d: Delta, fallback: string) => (d ? `${d.pct >= 0 ? "+" : "−"}${Math.abs(d.pct).toFixed(1).replace(".", ",")}% ${d.label}` : fallback);

/* ---------- penjualan ---------- */
export type ProductRow = { p: ReportProduct; units: number; revenue: number; cost: number; profit: number; margin: number; share: number };

export function salesAgg(data: ReportData, idx: number[]) {
  const rows: ProductRow[] = data.products.map((p) => {
    const units = sum(data.unitsSold[p.id] ?? [], idx);
    const revenue = units * p.price;
    const cost = units * p.cost;
    return { p, units, revenue, cost, profit: revenue - cost, margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0, share: 0 };
  });
  const revenue = rows.reduce((s, r) => s + r.revenue, 0);
  const cost = rows.reduce((s, r) => s + r.cost, 0);
  rows.forEach((r) => (r.share = revenue > 0 ? (r.revenue / revenue) * 100 : 0));
  const byCategory = data.categories
    .map((c) => ({ label: c, value: rows.filter((r) => r.p.category === c).reduce((s, r) => s + r.revenue, 0) }))
    .sort((a, b) => b.value - a.value);
  const orders = sum(data.orders, idx);
  return { rows, revenue, cost, profit: revenue - cost, margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0, orders, avgOrder: orders > 0 ? revenue / orders : 0, byCategory };
}

/** Pendapatan dan HPP per bulan, untuk grafik */
export function salesMonthly(data: ReportData) {
  return data.months.map((_, i) => {
    const a = salesAgg(data, [i]);
    return { revenue: a.revenue, cost: a.cost };
  });
}

/* ---------- pembelian ---------- */
export function purchaseAgg(data: ReportData, idx: number[]) {
  const rows = data.suppliers
    .map((s) => ({ s, spend: sum(data.purchases[s.id] ?? [], idx), share: 0 }))
    .sort((a, b) => b.spend - a.spend);
  const total = rows.reduce((r, x) => r + x.spend, 0);
  rows.forEach((r) => (r.share = total > 0 ? (r.spend / total) * 100 : 0));
  return { rows, total, active: rows.filter((r) => r.spend > 0).length };
}

export const purchaseMonthly = (data: ReportData) => data.months.map((_, i) => purchaseAgg(data, [i]).total);

/* ---------- stok ---------- */
export type StockState = "ok" | "low" | "out";
export const stockState = (p: ReportProduct): StockState => (p.stock <= 0 ? "out" : p.stock < p.min ? "low" : "ok");
/** Saran jumlah pesan: cukup untuk mencapai dua kali stok minimum (sama dengan tombol di form PO) */
export const reorderQty = (p: ReportProduct) => Math.max(p.min * 2 - p.stock, 1);

export function stockAgg(data: ReportData) {
  const units = data.products.reduce((s, p) => s + p.stock, 0);
  const value = data.products.reduce((s, p) => s + p.stock * p.cost, 0);
  const low = data.products.filter((p) => stockState(p) !== "ok");
  const out = data.products.filter((p) => stockState(p) === "out");
  const byCategory = data.categories
    .map((c) => {
      const list = data.products.filter((p) => p.category === c);
      return { label: c, value: list.reduce((s, p) => s + p.stock * p.cost, 0), units: list.reduce((s, p) => s + p.stock, 0) };
    })
    .sort((a, b) => b.value - a.value);
  const reorder = [...low].sort((a, b) => a.stock / a.min - b.stock / b.min);
  return { units, value, low, out, byCategory, reorder };
}

/* ---------- ekspor CSV ---------- */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM supaya Excel membaca UTF-8 dengan benar
  const blob = new Blob(["\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
