import type { Account, DocCalc, DocStatus, FinDoc, Txn } from "./types";
import type { ChipTone } from "@/components/ui/Chip";

export const idr = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;

export const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) / 86_400_000);

export function calcDoc(doc: FinDoc, txns: Txn[], today: string): DocCalc {
  const mine = txns.filter((t) => t.docId === doc.id);
  const paid = mine.reduce((s, t) => s + t.amount, 0);
  const balance = Math.max(doc.total - paid, 0);
  const status: DocStatus = paid <= 0 ? "unpaid" : paid >= doc.total ? "paid" : "partial";
  const daysLate = balance > 0 ? Math.max(daysBetween(doc.dueDate, today), 0) : 0;
  return { doc, paid, balance, status, overdue: daysLate > 0, daysLate, payments: mine.length };
}

export const balanceOf = (a: Account, txns: Txn[]) =>
  a.opening + txns.filter((t) => t.accountId === a.id).reduce((s, t) => s + (t.type === "in" ? t.amount : -t.amount), 0);

/** Kelompok umur piutang/utang: belum jatuh tempo, telat 1–30, 31–60, 60+ hari */
export const agingBuckets = ["Not due yet", "1–30 days late", "31–60 days late", "Over 60 days late"] as const;
export function bucketIndex(c: DocCalc) {
  if (c.daysLate <= 0) return 0;
  return c.daysLate <= 30 ? 1 : c.daysLate <= 60 ? 2 : 3;
}

export const statusMeta: Record<DocStatus, { label: string; tone: ChipTone }> = {
  unpaid: { label: "Unpaid", tone: "soft" },
  partial: { label: "Partial", tone: "orange" },
  paid: { label: "Paid", tone: "brown" },
};

export const accountTypeLabel = { cash: "Cash", bank: "Bank", ewallet: "E-wallet" } as const;
