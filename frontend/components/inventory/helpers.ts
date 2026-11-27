import type { Product } from "./types";

export const idr = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;

export const totalStock = (p: Product) => Object.values(p.stock).reduce((a, b) => a + b, 0);

export type StockStatus = "in" | "low" | "out";

export const statusOf = (qty: number, min: number): StockStatus => (qty <= 0 ? "out" : qty <= min ? "low" : "in");

export const statusMeta = {
  in: { label: "In stock", tone: "orange" },
  low: { label: "Low stock", tone: "red" },
  out: { label: "Out of stock", tone: "brown" },
} as const;
