"use client";

import { useState } from "react";
import Chip from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import Modal, { btnGhost, btnPrimary } from "@/components/ui/Modal";
import { fmtDate, flow, idr, isBooked, nextStep, orderMeta, payMeta, subtotalOf, taxOf } from "./helpers";
import type { Customer, OrderCalc, OrderStatus, Payment, PayMethod, SaleProduct } from "./types";

type Props = {
  calc: OrderCalc;
  customer?: Customer;
  products: SaleProduct[];
  payments: Payment[];
  methods: { value: PayMethod; label: string }[];
  taxRate: number;
  canManage: boolean;
  canPay: boolean;
  onClose: () => void;
  onStatus: (to: OrderStatus) => void;
  onPay: () => void;
};

export default function OrderModal({ calc, customer, products, payments, methods, taxRate, canManage, canPay, onClose, onStatus, onPay }: Props) {
  const { order } = calc;
  const [confirmCancel, setConfirmCancel] = useState(false);

  const step = nextStep[order.status];
  const idx = flow.indexOf(order.status);
  const nameOf = (id: string) => products.find((p) => p.id === id);
  const methodLabel = (m: PayMethod) => methods.find((x) => x.value === m)?.label ?? m;
  const mine = payments.filter((p) => p.orderId === order.id);
  const canCancel = canManage && order.status !== "completed" && order.status !== "cancelled";
  const canRecord = canPay && isBooked(order.status) && calc.balance > 0;

  return (
    <Modal title={`Order ${order.number}`} size="lg" onClose={onClose}>
      <div className="grid gap-5">
        {/* ringkasan */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="leading-tight">
            <p className="text-lg font-black">{customer?.name ?? "Unknown customer"}</p>
            <p className="mt-0.5 text-sm text-[#5d4a52]">
              {customer?.city}
              {customer?.phone ? ` · ${customer.phone}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-[#5d4a52]">
              Ordered {fmtDate(order.date)} · Due {fmtDate(order.dueDate)} · by {order.createdBy}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone={orderMeta[order.status].tone}>{orderMeta[order.status].label}</Chip>
            {isBooked(order.status) && <Chip tone={payMeta[calc.pay].tone}>{payMeta[calc.pay].label}</Chip>}
            {calc.overdue && <Chip tone="red">Overdue</Chip>}
          </div>
        </div>

        {/* alur status */}
        {order.status === "cancelled" ? (
          <p className="flex items-center gap-2 rounded-xl bg-[#c8362b]/10 px-4 py-3 text-sm font-semibold text-[#9f2a20]">
            <Icon name="alert" className="h-4 w-4 shrink-0" />
            This order was cancelled.
          </p>
        ) : (
          <ol className="flex items-center" aria-label="Order progress">
            {flow.map((s, i) => (
              <li key={s} className="flex flex-1 items-center last:flex-none">
                <span className="flex flex-col items-center gap-1.5">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition-colors duration-300 ${
                      i < idx ? "bg-[#1f1218] text-[#ff9d66]" : i === idx ? "bg-[#ff9d66]" : "bg-[#1f1218]/[0.08] text-[#5d4a52]"
                    }`}
                  >
                    {i < idx ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`text-[11px] font-bold ${i <= idx ? "" : "text-[#5d4a52]"}`}>{orderMeta[s].label}</span>
                </span>
                {i < flow.length - 1 && <span aria-hidden className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${i < idx ? "bg-[#1f1218]" : "bg-[#1f1218]/10"}`} />}
              </li>
            ))}
          </ol>
        )}

        {/* item */}
        <div className="overflow-x-auto rounded-xl border border-[#1f1218]/10">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="bg-[#1f1218]/[0.04] text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                <th className="py-2.5 pl-4 pr-3">Item</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">Price</th>
                <th className="py-2.5 pl-3 pr-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => {
                const p = nameOf(it.productId);
                return (
                  <tr key={it.productId} className="border-t border-[#1f1218]/10">
                    <td className="py-2.5 pl-4 pr-3">
                      <b className="block">{p?.name ?? it.productId}</b>
                      <span className="text-xs text-[#5d4a52]">{p?.sku}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {it.qty} {p?.unit}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{idr(it.price)}</td>
                    <td className="py-2.5 pl-3 pr-4 text-right font-bold tabular-nums">{idr(it.qty * it.price)}</td>
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
          {isBooked(order.status) && (
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

        {/* pembayaran */}
        {mine.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-black">Payments</p>
            <ul className="grid gap-1.5">
              {mine.map((p) => (
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
                  Cancel this order?
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
              <button type="button" onClick={onPay} className={btnGhost}>
                <Icon name="finance" className="h-4 w-4" />
                Record payment
              </button>
            )}
            {canManage && step && (
              <button type="button" onClick={() => onStatus(step.to)} className={btnPrimary}>
                {step.label}
                <Icon name="arrow" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
