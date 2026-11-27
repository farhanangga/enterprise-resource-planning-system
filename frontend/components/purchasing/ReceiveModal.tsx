"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import type { PurchaseOrder, PurchaseProduct, Warehouse } from "./types";

export type ReceivePayload = { poId: string; date: string; warehouseId: string; lines: { productId: string; qty: number }[] };

type Props = {
  order: PurchaseOrder;
  /** jumlah yang sudah diterima per produk */
  got: Record<string, number>;
  products: PurchaseProduct[];
  warehouses: Warehouse[];
  today: string;
  onClose: () => void;
  onSubmit: (payload: ReceivePayload) => void;
};

export default function ReceiveModal({ order, got, products, warehouses, today, onClose, onSubmit }: Props) {
  const remaining = (productId: string, qty: number) => Math.max(qty - (got[productId] ?? 0), 0);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [qty, setQty] = useState<Record<string, string>>(() => Object.fromEntries(order.items.map((i) => [i.productId, String(remaining(i.productId, i.qty))])));
  const [error, setError] = useState<string>();

  const productOf = (id: string) => products.find((p) => p.id === id);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!warehouseId) return setError("Choose the warehouse that receives the goods.");
    if (!date) return setError("Pick the date the goods arrived.");
    const lines: ReceivePayload["lines"] = [];
    for (const it of order.items) {
      const left = remaining(it.productId, it.qty);
      const n = Number(qty[it.productId] || 0);
      const name = productOf(it.productId)?.name ?? it.productId;
      if (!Number.isInteger(n) || n < 0) return setError(`Enter a whole quantity for ${name}.`);
      if (n > left) return setError(`${name}: only ${left} still to receive.`);
      if (n > 0) lines.push({ productId: it.productId, qty: n });
    }
    if (lines.length === 0) return setError("Enter the quantity received for at least one item.");
    setError(undefined);
    onSubmit({ poId: order.id, date, warehouseId, lines });
  }

  return (
    <Modal title={`Receive goods · ${order.number}`} size="lg" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="r-wh" label="Receiving warehouse">
            <select id="r-wh" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} · {w.city}
                </option>
              ))}
            </select>
          </Field>
          <Field id="r-date" label="Arrival date">
            <input id="r-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls()} />
          </Field>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1f1218]/10">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="bg-[#1f1218]/[0.04] text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                <th className="py-2.5 pl-4 pr-3">Item</th>
                <th className="px-3 py-2.5 text-right">Ordered</th>
                <th className="px-3 py-2.5 text-right">Received</th>
                <th className="py-2.5 pl-3 pr-4 text-right">Receiving now</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => {
                const p = productOf(it.productId);
                const left = remaining(it.productId, it.qty);
                return (
                  <tr key={it.productId} className="border-t border-[#1f1218]/10">
                    <td className="py-2.5 pl-4 pr-3">
                      <b className="block">{p?.name ?? it.productId}</b>
                      <span className="text-xs text-[#5d4a52]">{p?.sku}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {it.qty} {p?.unit}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{got[it.productId] ?? 0}</td>
                    <td className="py-2.5 pl-3 pr-4">
                      {left === 0 ? (
                        <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-[#5d4a52]">
                          <Icon name="check" className="h-4 w-4" />
                          Complete
                        </span>
                      ) : (
                        <input
                          aria-label={`Quantity received for ${p?.name ?? it.productId}`}
                          type="number"
                          min={0}
                          max={left}
                          inputMode="numeric"
                          value={qty[it.productId] ?? ""}
                          onChange={(e) => setQty({ ...qty, [it.productId]: e.target.value })}
                          className={`${fieldCls()} ml-auto w-24 text-right`}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs font-semibold text-[#5d4a52]">Stock is added to the chosen warehouse. If only part of the order arrived, enter what you received and receive the rest later.</p>

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
            Save receipt
          </button>
        </div>
      </form>
    </Modal>
  );
}
