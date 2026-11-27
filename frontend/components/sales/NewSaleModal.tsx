"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import { idr } from "./helpers";
import type { Customer, SaleProduct } from "./types";

export type NewSalePayload = {
  customerId: string;
  date: string;
  items: { productId: string; qty: number; price: number }[];
  discount: number;
  note: string;
  confirm: boolean;
};

type Line = { key: number; productId: string; qty: string };

type Props = {
  customers: Customer[];
  products: SaleProduct[];
  today: string;
  taxRate: number;
  /** true = boleh langsung mengonfirmasi order (izin sales:manage) */
  canConfirm: boolean;
  onClose: () => void;
  onSubmit: (payload: NewSalePayload) => void;
};

export default function NewSaleModal({ customers, products, today, taxRate, canConfirm, onClose, onSubmit }: Props) {
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(today);
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: "", qty: "1" }]);
  const [discount, setDiscount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  const productOf = (id: string) => products.find((p) => p.id === id);
  const setLine = (key: number, patch: Partial<Line>) => setLines(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const addLine = () => setLines([...lines, { key: Math.max(0, ...lines.map((l) => l.key)) + 1, productId: "", qty: "1" }]);
  const removeLine = (key: number) => setLines(lines.length === 1 ? lines : lines.filter((l) => l.key !== key));

  const subtotal = lines.reduce((s, l) => {
    const p = productOf(l.productId);
    const q = Number(l.qty);
    return s + (p && Number.isFinite(q) && q > 0 ? p.price * q : 0);
  }, 0);
  const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const tax = Math.round((subtotal - disc) * taxRate);
  const total = subtotal - disc + tax;

  function submit(confirm: boolean) {
    if (!customerId) return setError("Choose a customer.");
    if (!date) return setError("Pick an order date.");
    const items: NewSalePayload["items"] = [];
    for (const l of lines) {
      const p = productOf(l.productId);
      const q = Number(l.qty);
      if (!p) return setError("Choose a product on every line (or remove the empty line).");
      if (!Number.isInteger(q) || q <= 0) return setError(`Enter a whole quantity for ${p.name}.`);
      if (q > p.stock) return setError(`Only ${p.stock} ${p.unit} of ${p.name} in stock.`);
      items.push({ productId: p.id, qty: q, price: p.price });
    }
    const merged = items.reduce<NewSalePayload["items"]>((acc, it) => {
      const found = acc.find((x) => x.productId === it.productId);
      if (found) found.qty += it.qty;
      else acc.push({ ...it });
      return acc;
    }, []);
    if (Number(discount) < 0) return setError("Discount cannot be negative.");
    setError(undefined);
    onSubmit({ customerId, date, items: merged, discount: disc, note: note.trim(), confirm });
  }

  return (
    <Modal title="New sale" size="lg" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(canConfirm);
        }}
        noValidate
        className="grid gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="s-customer" label="Customer">
            <select id="s-customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={`${fieldCls(!!error && !customerId)} cursor-pointer`}>
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.termDays > 0 ? ` · ${c.termDays}-day terms` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field id="s-date" label="Order date">
            <input id="s-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls()} />
          </Field>
        </div>

        <div>
          <p className="mb-1.5 text-[13px] font-bold">Items</p>
          <ul className="grid gap-2">
            {lines.map((l) => {
              const p = productOf(l.productId);
              const q = Number(l.qty);
              return (
                <li key={l.key} className="grid gap-2 rounded-xl bg-[#1f1218]/[0.04] p-2 sm:grid-cols-[1fr_84px_120px_36px] sm:items-center">
                  <select
                    aria-label="Product"
                    value={l.productId}
                    onChange={(e) => setLine(l.key, { productId: e.target.value })}
                    className={`${fieldCls()} cursor-pointer`}
                  >
                    <option value="">Select product…</option>
                    {products.map((x) => (
                      <option key={x.id} value={x.id} disabled={x.stock <= 0}>
                        {x.name} · {idr(x.price)} ({x.stock > 0 ? `${x.stock} in stock` : "out of stock"})
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Quantity"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={l.qty}
                    onChange={(e) => setLine(l.key, { qty: e.target.value })}
                    className={fieldCls(!!p && Number.isFinite(q) && q > p.stock)}
                  />
                  <span className="px-1 text-right text-sm font-black tabular-nums">{p && q > 0 ? idr(p.price * q) : "–"}</span>
                  <button
                    type="button"
                    onClick={() => removeLine(l.key)}
                    disabled={lines.length === 1}
                    aria-label="Remove line"
                    className="grid h-9 w-9 place-items-center justify-self-end rounded-full transition-colors duration-200 hover:bg-[#c8362b]/10 disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Icon name="close" className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={addLine} className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-[#e8641f] transition-colors duration-200 hover:bg-[#ff9d66]/20">
            <Icon name="plus" className="h-4 w-4" />
            Add item
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="s-discount" label="Discount (Rp, optional)">
            <input id="s-discount" type="number" min={0} inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className={fieldCls()} />
          </Field>
          <Field id="s-note" label="Note (optional)">
            <input id="s-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Deliver before noon" className={fieldCls()} />
          </Field>
        </div>

        <dl className="grid gap-1.5 rounded-xl bg-[#ff9d66]/15 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <dt className="font-semibold">Subtotal</dt>
            <dd className="font-bold tabular-nums">{idr(subtotal)}</dd>
          </div>
          {disc > 0 && (
            <div className="flex justify-between">
              <dt className="font-semibold">Discount</dt>
              <dd className="font-bold tabular-nums">− {idr(disc)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="font-semibold">VAT {Math.round(taxRate * 100)}%</dt>
            <dd className="font-bold tabular-nums">{idr(tax)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-[#1f1218]/10 pt-2 text-base">
            <dt className="font-black">Total</dt>
            <dd className="font-black tabular-nums">{idr(total)}</dd>
          </div>
        </dl>

        {!canConfirm && (
          <p className="flex items-center gap-2 text-xs font-semibold text-[#5d4a52]">
            <Chip tone="soft">Draft</Chip> Your role saves new orders as drafts. A Manager or Admin confirms them.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-[#c8362b]/10 px-4 py-2.5 text-sm font-semibold text-[#9f2a20]">
            {error}
          </p>
        )}

        <div className="mt-1 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          {canConfirm && (
            <button type="button" onClick={() => submit(false)} className={btnGhost}>
              Save as draft
            </button>
          )}
          <button type="submit" className={btnPrimary}>
            {canConfirm ? "Create & confirm" : "Create order"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
