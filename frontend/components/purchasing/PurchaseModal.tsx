"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import Modal, { btnGhost, btnPrimary } from "@/components/ui/Modal";
import { flow, fmtDate, idr, isOpenBill, payMeta, poMeta, receivedMap, subtotalOf, taxOf } from "./helpers";
import type { PayMethod, PoCalc, PoStatus, PurchaseProduct, Receipt, Supplier, SupplierPayment, Warehouse } from "./types";

type Props = {
  calc: PoCalc;
  supplier?: Supplier;
  products: PurchaseProduct[];
  warehouses: Warehouse[];
  receipts: Receipt[];
  payments: SupplierPayment[];
  methods: { value: PayMethod; label: string }[];
  taxRate: number;
  canManage: boolean;
  canReceive: boolean;
  canPay: boolean;
  onClose: () => void;
  onStatus: (to: PoStatus) => void;
  onReceive: () => void;
  onPay: () => void;
};

export default function PurchaseModal({ calc, supplier, products, warehouses, receipts, payments, methods, taxRate, canManage, canReceive, canPay, onClose, onStatus, onReceive, onPay }: Props) {
  const { order } = calc;
  const [confirmCancel, setConfirmCancel] = useState(false);

  const idx = flow.indexOf(order.status);
  const productOf = (id: string) => products.find((p) => p.id === id);
  const methodLabel = (m: PayMethod) => methods.find((x) => x.value === m)?.label ?? m;
  const warehouseName = (id: string) => warehouses.find((w) => w.id === id)?.name ?? id;
  const got = receivedMap(order.id, receipts);
  const myReceipts = receipts.filter((r) => r.poId === order.id);
  const myPayments = payments.filter((p) => p.poId === order.id);
  const showReceived = order.status === "ordered" || order.status === "received";

  // PO yang barangnya sudah masuk tidak bisa dibatalkan lagi
  const canCancel = canManage && (order.status === "draft" || order.status === "ordered") && calc.receivedUnits === 0;
  const canGoods = canReceive && order.status === "ordered" && calc.delivery !== "full";
  const canRecord = canPay && isOpenBill(order.status) && calc.balance > 0;
  const canPlace = canManage && order.status === "draft";

  return (
    <Modal title={`Purchase order ${order.number}`} size="lg" onClose={onClose}>
      <div className="grid gap-5">
        {/* ringkasan */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="leading-tight">
            <p className="text-lg font-black">{supplier?.name ?? "Unknown supplier"}</p>
            <p className="mt-0.5 text-sm text-[#5d4a52]">
              {supplier?.city}
              {supplier?.phone ? ` · ${supplier.phone}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-[#5d4a52]">
              Ordered {fmtDate(order.date)} · Expected {fmtDate(order.expectedDate)} · Bill due {fmtDate(order.dueDate)} · by {order.createdBy}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone={poMeta[order.status].tone}>{poMeta[order.status].label}</Chip>
            {order.status === "ordered" && calc.delivery === "partial" && <Chip tone="orange">Partly received</Chip>}
            {calc.late && <Chip tone="red">Late</Chip>}
            {isOpenBill(order.status) && canPay && <Chip tone={payMeta[calc.pay].tone}>{payMeta[calc.pay].label}</Chip>}
            {calc.overdue && canPay && <Chip tone="red">Overdue</Chip>}
          </div>
        </div>

        {/* alur status */}
        {order.status === "cancelled" ? (
          <p className="flex items-center gap-2 rounded-xl bg-[#c8362b]/10 px-4 py-3 text-sm font-semibold text-[#9f2a20]">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            This purchase order was cancelled.
          </p>
        ) : (
          <ol className="flex items-center" aria-label="Purchase order progress">
            {flow.map((s, i) => (
              <li key={s} className="flex flex-1 items-center last:flex-none">
                <span className="flex flex-col items-center gap-1.5">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition-colors duration-300 ${
                      i < idx || (i === idx && s === "received") ? "bg-[#1f1218] text-[#ff9d66]" : i === idx ? "bg-[#ff9d66]" : "bg-[#1f1218]/[0.08] text-[#5d4a52]"
                    }`}
                  >
                    {i < idx || (i === idx && s === "received") ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`text-[11px] font-bold ${i <= idx ? "" : "text-[#5d4a52]"}`}>{poMeta[s].label}</span>
                </span>
                {i < flow.length - 1 && <span aria-hidden className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${i < idx ? "bg-[#1f1218]" : "bg-[#1f1218]/10"}`} />}
              </li>
            ))}
          </ol>
        )}

        {/* item */}
        <div className="overflow-x-auto rounded-xl border border-[#1f1218]/10">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="bg-[#1f1218]/[0.04] text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                <th className="py-2.5 pl-4 pr-3">Item</th>
                <th className="px-3 py-2.5 text-right">Ordered</th>
                <th className="px-3 py-2.5 text-right">Received</th>
                <th className="px-3 py-2.5 text-right">Unit cost</th>
                <th className="py-2.5 pl-3 pr-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => {
                const p = productOf(it.productId);
                const r = got[it.productId] ?? 0;
                return (
                  <tr key={it.productId} className="border-t border-[#1f1218]/10">
                    <td className="py-2.5 pl-4 pr-3">
                      <b className="block">{p?.name ?? it.productId}</b>
                      <span className="text-xs text-[#5d4a52]">{p?.sku}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {it.qty} {p?.unit}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {showReceived ? (
                        <span className={r >= it.qty ? "font-bold" : r > 0 ? "font-bold text-[#e8641f]" : "text-[#5d4a52]"}>
                          {r} / {it.qty}
                        </span>
                      ) : (
                        <span className="text-[#5d4a52]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{idr(it.cost)}</td>
                    <td className="py-2.5 pl-3 pr-4 text-right font-bold tabular-nums">{idr(it.qty * it.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* total */}
        <dl className="ml-auto grid w-full gap-1.5 text-sm sm:max-w-xs">
          <div className="flex justify-between">
            <dt className="font-semibold">Subtotal</dt>
            <dd className="font-bold tabular-nums">{idr(subtotalOf(order))}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="font-semibold">Discount</dt>
              <dd className="font-bold tabular-nums">− {idr(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="font-semibold">VAT {Math.round(taxRate * 100)}%</dt>
            <dd className="font-bold tabular-nums">{idr(taxOf(order, taxRate))}</dd>
          </div>
          <div className="flex justify-between border-t border-[#1f1218]/10 pt-2 text-base">
            <dt className="font-black">Total</dt>
            <dd className="font-black tabular-nums">{idr(calc.total)}</dd>
          </div>
          {isOpenBill(order.status) && canPay && (
            <>
              <div className="flex justify-between">
                <dt className="font-semibold">Paid</dt>
                <dd className="font-bold tabular-nums">{idr(calc.paid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">Balance</dt>
                <dd className={`font-black tabular-nums ${calc.balance > 0 ? "text-[#9f2a20]" : ""}`}>{idr(calc.balance)}</dd>
              </div>
            </>
          )}
        </dl>

        {order.note && (
          <p className="rounded-xl bg-[#ff9d66]/15 px-4 py-2.5 text-sm">
            <b>Note:</b> {order.note}
          </p>
        )}

        {/* penerimaan barang */}
        {myReceipts.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-black">Goods received</p>
            <ul className="grid gap-1.5">
              {myReceipts.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#1f1218]/[0.04] px-3 py-2 text-sm">
                  <span className="leading-tight">
                    <b className="block">{r.lines.map((l) => `${productOf(l.productId)?.name ?? l.productId} × ${l.qty}`).join(", ")}</b>
                    <span className="text-xs text-[#5d4a52]">
                      {fmtDate(r.date)} · {warehouseName(r.warehouseId)}
                    </span>
                  </span>
                  <span className="text-xs text-[#5d4a52]">by {r.by}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* pembayaran ke supplier */}
        {canPay && myPayments.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-black">Payments</p>
            <ul className="grid gap-1.5">
              {myPayments.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#1f1218]/[0.04] px-3 py-2 text-sm">
                  <span className="leading-tight">
                    <b className="block">{idr(p.amount)}</b>
                    <span className="text-xs text-[#5d4a52]">
                      {fmtDate(p.date)} · {methodLabel(p.method)}
                      {p.ref ? ` · ${p.ref}` : ""}
                    </span>
                  </span>
                  <span className="text-xs text-[#5d4a52]">by {p.by}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* aksi */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1f1218]/10 pt-4">
          <div>
            {canCancel &&
              (confirmCancel ? (
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  Cancel this purchase order?
                  <button type="button" onClick={() => onStatus("cancelled")} className="rounded-full bg-[#c8362b] px-4 py-1.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-[#9f2a20]">
                    Yes, cancel
                  </button>
                  <button type="button" onClick={() => setConfirmCancel(false)} className="rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-200 hover:bg-[#1f1218]/[0.08]">
                    Keep
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmCancel(true)} className="rounded-full px-4 py-2 text-sm font-bold text-[#9f2a20] transition-colors duration-200 hover:bg-[#c8362b]/10">
                  Cancel order
                </button>
              ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {canRecord && (
              <button type="button" onClick={onPay} className={canGoods ? btnGhost : btnPrimary}>
                <Icon name="finance" className="h-4 w-4" />
                Pay supplier
              </button>
            )}
            {canGoods && (
              <button type="button" onClick={onReceive} className={btnPrimary}>
                <Icon name="inventory" className="h-4 w-4" />
                Receive goods
              </button>
            )}
            {canPlace && (
              <button type="button" onClick={() => onStatus("ordered")} className={btnPrimary}>
                Place order
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
