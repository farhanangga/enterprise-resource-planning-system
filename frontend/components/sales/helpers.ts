import type { ChipTone } from "@/components/ui/Chip";
import type { Order, OrderCalc, OrderStatus, Payment, PayStatus } from "./types";

export const idr = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;

export const subtotalOf = (o: Order) => o.items.reduce((s, i) => s + i.qty * i.price, 0);
export const taxOf = (o: Order, rate: number) => Math.round((subtotalOf(o) - o.discount) * rate);
export const totalOf = (o: Order, rate: number) => subtotalOf(o) - o.discount + taxOf(o, rate);
export const paidOf = (o: Order, payments: Payment[]) => payments.filter((p) => p.orderId === o.id).reduce((s, p) => s + p.amount, 0);

export const payStatusOf = (total: number, paid: number): PayStatus => (paid <= 0 ? "unpaid" : paid >= total ? "paid" : "partial");

/** Order yang sudah "berjalan" (dihitung sebagai penjualan dan bisa ditagih) */
export const isBooked = (s: OrderStatus) => s === "confirmed" || s === "shipped" || s === "completed";

export function calcOrder(o: Order, payments: Payment[], rate: number, today: string): OrderCalc {
  const total = totalOf(o, rate);
  const paid = paidOf(o, payments);
  const balance = Math.max(total - paid, 0);
  return { order: o, total, paid, balance, pay: payStatusOf(total, paid), overdue: isBooked(o.status) && balance > 0 && o.dueDate < today };
}

/* ---------- tanggal ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ---------- label dan warna status ---------- */
export const orderMeta: Record<OrderStatus, { label: string; tone: ChipTone }> = {
  draft: { label: "Draft", tone: "soft" },
  confirmed: { label: "Confirmed", tone: "orange" },
  shipped: { label: "Shipped", tone: "brown" },
  completed: { label: "Completed", tone: "orange" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const payMeta: Record<PayStatus, { label: string; tone: ChipTone }> = {
  unpaid: { label: "Unpaid", tone: "soft" },
  partial: { label: "Partial", tone: "orange" },
  paid: { label: "Paid", tone: "brown" },
};

/** Alur status normal */
export const flow: OrderStatus[] = ["draft", "confirmed", "shipped", "completed"];

export const nextStep: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  draft: { to: "confirmed", label: "Confirm order" },
  confirmed: { to: "shipped", label: "Mark as shipped" },
  shipped: { to: "completed", label: "Mark as completed" },
};
