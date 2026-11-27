"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import type { MovementType, Product, Warehouse } from "./types";

export type AdjustPayload = { productId: string; warehouseId: string; type: MovementType; qty: number; note: string };

type Props = {
  products: Product[];
  warehouses: Warehouse[];
  initialProductId?: string;
  onClose: () => void;
  onSubmit: (payload: AdjustPayload) => void;
};

const types: { value: MovementType; label: string; hint: string }[] = [
  { value: "in", label: "Stock in", hint: "Add items received" },
  { value: "out", label: "Stock out", hint: "Remove items sent or lost" },
  { value: "adjust", label: "Count", hint: "Set the counted quantity" },
];

export default function AdjustModal({ products, warehouses, initialProductId, onClose, onSubmit }: Props) {
  const [productId, setProductId] = useState(initialProductId ?? products[0]?.id ?? "");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [type, setType] = useState<MovementType>("in");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  const product = products.find((p) => p.id === productId);
  const current = product?.stock[warehouseId] ?? 0;
  const n = qty.trim() === "" ? NaN : Number(qty);
  const result = Number.isFinite(n) ? (type === "in" ? current + n : type === "out" ? current - n : n) : null;

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!product) return setError("Choose a product.");
    if (!Number.isFinite(n) || !Number.isInteger(n)) return setError("Enter a whole number.");
    if (type !== "adjust" && n <= 0) return setError("Quantity must be more than 0.");
    if (type === "adjust" && n < 0) return setError("Counted quantity cannot be negative.");
    if (type === "out" && n > current) return setError(`Only ${current} ${product.unit} available in this warehouse.`);
    setError(undefined);
    onSubmit({ productId, warehouseId, type, qty: n, note: note.trim() });
  }

  return (
    <Modal title="Adjust stock" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <Field id="a-product" label="Product">
          <select id="a-product" value={productId} onChange={(e) => setProductId(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </Field>

        <Field id="a-wh" label="Warehouse">
          <select id="a-wh" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>

        <div>
          <p className="mb-1.5 text-[13px] font-bold">Type</p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Adjustment type">
            {types.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={type === t.value}
                onClick={() => setType(t.value)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-colors duration-200 ${
                  type === t.value ? "border-[#1f1218] bg-[#1f1218] text-white" : "border-[#1f1218]/15 hover:bg-[#ff9d66]/25"
                }`}
              >
                <b className="block text-sm">{t.label}</b>
                <span className={`text-[11px] leading-tight ${type === t.value ? "text-white/70" : "text-[#5d4a52]"}`}>{t.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <Field id="a-qty" label={type === "adjust" ? "Counted quantity" : "Quantity"}>
          <input id="a-qty" type="number" min={0} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className={fieldCls(!!error)} />
        </Field>

        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#ff9d66]/15 px-4 py-3 text-sm font-semibold">
          <span>
            Current: <b className="font-black">{current}</b> {product?.unit}
          </span>
          {result !== null && (
            <>
              <span aria-hidden>→</span>
              <span>
                New: <b className="font-black">{Math.max(result, 0)}</b> {product?.unit}
              </span>
              {result < 0 && <Chip tone="red">Not enough stock</Chip>}
            </>
          )}
        </div>

        <Field id="a-note" label="Note (optional)">
          <input id="a-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Supplier delivery PO-2031" className={fieldCls()} />
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-[#c8362b]/10 px-4 py-2.5 text-sm font-semibold text-[#9f2a20]">
            {error}
          </p>
        )}

        <div className="mt-1 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            Save adjustment
          </button>
        </div>
      </form>
    </Modal>
  );
}
