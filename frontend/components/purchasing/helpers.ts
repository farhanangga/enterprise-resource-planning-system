import type { ChipTone } from "@/components/ui/Chip";
import type { PayStatus, PoCalc, PoStatus, PurchaseOrder, Receipt, SupplierPayment } from "./types";

export const idr = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;

export const subtotalOf = (o: PurchaseOrder) => o.items.reduce((s, i) => s + i.qty * i.cost, 0);
export const taxOf = (o: PurchaseOrder, rate: number) => Math.round((subtotalOf(o) - o.discount) * rate);
export const totalOf = (o: PurchaseOrder, rate: number) => subtotalOf(o) - o.discount + taxOf(o, rate);
export const paidOf = (o: PurchaseOrder, payments: SupplierPayment[]) => payments.filter((p) => p.poId === o.id).reduce((s, p) => s + p.amount, 0);

export const payStatusOf = (total: number, paid: number): PayStatus => (paid <= 0 ? "unpaid" : paid >= total ? "paid" : "partial");

/** PO yang sudah dipesan ke supplier (dihitung sebagai pembelian dan bisa ditagih) */
export const isOpenBill = (s: PoStatus) => s === "ordered" || s === "received";

/** Jumlah yang sudah diterima per produk untuk satu PO */
export function receivedMap(poId: string, receipts: Receipt[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of receipts) {
    if (r.poId !== poId) continue;
    for (const l of r.lines) map[l.productId] = (map[l.productId] ?? 0) + l.qty;
  }
  return map;
}

export function calcPo(o: PurchaseOrder, payments: SupplierPayment[], receipts: Receipt[], rate: number, today: string): PoCalc {
  const total = totalOf(o, rate);
  const paid = paidOf(o, payments);
  const balance = Math.max(total - paid, 0);
  const got = receivedMap(o.id, receipts);
  const units = o.items.reduce((s, i) => s + i.qty, 0);
  const receivedUnits = o.items.reduce((s, i) => s + Math.min(got[i.productId] ?? 0, i.qty), 0);
  const delivery = receivedUnits <= 0 ? "none" : receivedUnits >= units ? "full" : "partial";
  return {
    order: o,
    total,
    paid,
    balance,
    pay: payStatusOf(total, paid),
    overdue: isOpenBill(o.status) && balance > 0 && o.dueDate < today,
    units,
    receivedUnits,
    delivery,
    late: o.status === "ordered" && delivery !== "full" && o.expectedDate < today,
  };
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
export const poMeta: Record<PoStatus, { label: string; tone: ChipTone }> = {
  draft: { label: "Draft", tone: "soft" },
  ordered: { label: "Ordered", tone: "orange" },
  received: { label: "Received", tone: "brown" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const payMeta: Record<PayStatus, { label: string; tone: ChipTone }> = {
  unpaid: { label: "Unpaid", tone: "soft" },
  partial: { label: "Partial", tone: "orange" },
  paid: { label: "Paid", tone: "brown" },
};

/** Alur status normal. "received" diset otomatis saat semua barang sudah diterima. */
export const flow: PoStatus[] = ["draft", "ordered", "received"];
