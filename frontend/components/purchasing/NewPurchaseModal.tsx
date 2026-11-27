"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import { addDays, idr } from "./helpers";
import type { PurchaseProduct, Supplier } from "./types";

export type NewPoPayload = {
  supplierId: string;
  date: string;
  expectedDate: string;
  items: { productId: string; qty: number; cost: number }[];
  discount: number;
  note: string;
  place: boolean;
};

type Line = { key: number; productId: string; qty: string; cost: string };

type Props = {
  suppliers: Supplier[];
  products: PurchaseProduct[];
  today: string;
  taxRate: number;
  /** true = boleh langsung memesan ke supplier (izin purchasing:manage) */
  canPlace: boolean;
  onClose: () => void;
  onSubmit: (payload: NewPoPayload) => void;
};

export default function NewPurchaseModal({ suppliers, products, today, taxRate, canPlace, onClose, onSubmit }: Props) {
  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState(today);
  const [expected, setExpected] = useState(addDays(today, 3));
  const [expectedTouched, setExpectedTouched] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: "", qty: "1", cost: "" }]);
  const [discount, setDiscount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  const productOf = (id: string) => products.find((p) => p.id === id);
  const supplierOf = (id: string) => suppliers.find((s) => s.id === id);
  const setLine = (key: number, patch: Partial<Line>) => setLines(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const nextKey = () => Math.max(0, ...lines.map((l) => l.key)) + 1;
  const addLine = () => setLines([...lines, { key: nextKey(), productId: "", qty: "1", cost: "" }]);
  const removeLine = (key: number) => setLines(lines.length === 1 ? lines : lines.filter((l) => l.key !== key));

  // perkiraan tiba mengikuti lama pengiriman supplier, selama belum diubah manual
  function pickSupplier(id: string) {
    setSupplierId(id);
    if (!expectedTouched) setExpected(addDays(date, supplierOf(id)?.leadDays ?? 3));
  }
  function pickDate(v: string) {
    setDate(v);
    if (!expectedTouched && v) setExpected(addDays(v, supplierOf(supplierId)?.leadDays ?? 3));
  }
  function pickProduct(key: number, id: string) {
    setLine(key, { productId: id, cost: id ? String(productOf(id)?.cost ?? "") : "" });
  }

  // isi otomatis dengan produk yang stoknya di bawah minimum
  const lowStock = products.filter((p) => p.stock < p.min);
  function addLowStock() {
    const used = new Set(lines.map((l) => l.productId));
    const fresh = lowStock.filter((p) => !used.has(p.id));
    if (fresh.length === 0) return;
    const base = lines.filter((l) => l.productId); // buang baris kosong
    let k = Math.max(0, ...lines.map((l) => l.key));
    setLines([...base, ...fresh.map((p) => ({ key: ++k, productId: p.id, qty: String(Math.max(p.min * 2 - p.stock, 1)), cost: String(p.cost) }))]);
  }
  const lowLeft = lowStock.filter((p) => !lines.some((l) => l.productId === p.id)).length;

  const subtotal = lines.reduce((s, l) => {
    const q = Number(l.qty);
    const c = Number(l.cost);
    return s + (l.productId && q > 0 && c >= 0 ? q * c : 0);
  }, 0);
  const disc = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const tax = Math.round((subtotal - disc) * taxRate);
  const total = subtotal - disc + tax;

  function submit(place: boolean) {
    if (!supplierId) return setError("Choose a supplier.");
    if (!date) return setError("Pick an order date.");
    if (!expected || expected < date) return setError("The expected delivery can’t be before the order date.");
    const items: NewPoPayload["items"] = [];
    for (const l of lines) {
      const p = productOf(l.productId);
      const q = Number(l.qty);
      const c = Number(l.cost);
      if (!p) return setError("Choose a product on every line (or remove the empty line).");
      if (!Number.isInteger(q) || q <= 0) return setError(`Enter a whole quantity for ${p.name}.`);
      if (!Number.isFinite(c) || c < 0) return setError(`Enter a unit cost for ${p.name}.`);
      if (items.some((x) => x.productId === p.id)) return setError(`${p.name} is on two lines. Combine them into one.`);
      items.push({ productId: p.id, qty: q, cost: Math.round(c) });
    }
    if (Number(discount) < 0) return setError("Discount cannot be negative.");
    setError(undefined);
    onSubmit({ supplierId, date, expectedDate: expected, items, discount: disc, note: note.trim(), place });
  }

  const sup = supplierOf(supplierId);

  return (
    <Modal title="New purchase order" size="lg" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(canPlace);
        }}
        noValidate
        className="grid gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="po-supplier" label="Supplier" hint={sup ? `${sup.termDays > 0 ? `${sup.termDays}-day terms` : "Pay on delivery"} · about ${sup.leadDays} days to deliver` : undefined}>
            <select id="po-supplier" value={supplierId} onChange={(e) => pickSupplier(e.target.value)} className={`${fieldCls(!!error && !supplierId)} cursor-pointer`}>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="po-date" label="Order date">
            <input id="po-date" type="date" value={date} onChange={(e) => pickDate(e.target.value)} className={fieldCls()} />
          </Field>
          <Field id="po-expected" label="Expected delivery">
            <input
              id="po-expected"
              type="date"
              value={expected}
              min={date}
              onChange={(e) => (setExpected(e.target.value), setExpectedTouched(true))}
              className={fieldCls()}
            />
          </Field>
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-bold">Items</p>
            {lowLeft > 0 && (
              <button type="button" onClick={addLowStock} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-[#e8641f] transition-colors duration-200 hover:bg-[#ff9d66]/20">
                <Icon name="alert" className="h-3.5 w-3.5" />
                Add {lowLeft} {lowLeft === 1 ? "item" : "items"} below minimum stock
              </button>
            )}
          </div>
          <ul className="grid gap-2">
            {lines.map((l) => {
              const p = productOf(l.productId);
              const q = Number(l.qty);
              const c = Number(l.cost);
              return (
                <li key={l.key} className="grid gap-2 rounded-xl bg-[#1f1218]/[0.04] p-2 sm:grid-cols-[1fr_76px_112px_112px_36px] sm:items-center">
                  <select aria-label="Product" value={l.productId} onChange={(e) => pickProduct(l.key, e.target.value)} className={`${fieldCls()} cursor-pointer`}>
                    <option value="">Select product…</option>
                    {products.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name} · {x.stock} in stock{x.stock < x.min ? " (low)" : ""}
                      </option>
                    ))}
                  </select>
                  <input aria-label="Quantity" type="number" min={1} inputMode="numeric" value={l.qty} onChange={(e) => setLine(l.key, { qty: e.target.value })} className={fieldCls()} />
                  <input
                    aria-label="Unit cost (Rp)"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={l.cost}
                    onChange={(e) => setLine(l.key, { cost: e.target.value })}
                    placeholder="Unit cost"
                    className={fieldCls()}
                  />
                  <span className="px-1 text-right text-sm font-black tabular-nums">{p && q > 0 && c >= 0 ? idr(q * c) : "–"}</span>
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
          <Field id="po-discount" label="Discount (Rp, optional)">
            <input id="po-discount" type="number" min={0} inputMode="numeric" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className={fieldCls()} />
          </Field>
          <Field id="po-note" label="Note (optional)">
            <input id="po-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Deliver to Main Warehouse" className={fieldCls()} />
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

        {!canPlace && (
          <p className="flex items-center gap-2 text-xs font-semibold text-[#5d4a52]">
            <Chip tone="soft">Draft</Chip> Your role saves new purchase orders as drafts. A Manager or Admin places them with the supplier.
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
          {canPlace && (
            <button type="button" onClick={() => submit(false)} className={btnGhost}>
              Save as draft
            </button>
          )}
          <button type="submit" className={btnPrimary}>
            {canPlace ? "Create & place order" : "Create draft"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
