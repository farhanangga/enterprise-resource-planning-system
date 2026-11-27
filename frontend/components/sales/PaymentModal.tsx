"use client";

import { useState } from "react";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import { idr } from "./helpers";
import type { Customer, OrderCalc, PayMethod } from "./types";

export type PaymentPayload = { orderId: string; date: string; amount: number; method: PayMethod; ref: string };

type Props = {
  /** order yang masih punya sisa tagihan */
  payable: OrderCalc[];
  customers: Customer[];
  methods: { value: PayMethod; label: string }[];
  today: string;
  initialOrderId?: string;
  onClose: () => void;
  onSubmit: (payload: PaymentPayload) => void;
};

export default function PaymentModal({ payable, customers, methods, today, initialOrderId, onClose, onSubmit }: Props) {
  const first = initialOrderId && payable.some((c) => c.order.id === initialOrderId) ? initialOrderId : (payable[0]?.order.id ?? "");
  const [orderId, setOrderId] = useState(first);
  const [amount, setAmount] = useState(() => String(payable.find((c) => c.order.id === first)?.balance ?? ""));
  const [method, setMethod] = useState<PayMethod>(methods[0]?.value ?? "cash");
  const [date, setDate] = useState(today);
  const [ref, setRef] = useState("");
  const [error, setError] = useState<string>();

  const calc = payable.find((c) => c.order.id === orderId);
  const customer = (id: string) => customers.find((c) => c.id === id)?.name ?? "";
  const n = Number(amount);

  function pickOrder(id: string) {
    setOrderId(id);
    setAmount(String(payable.find((c) => c.order.id === id)?.balance ?? ""));
  }

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!calc) return setError("Choose an order to pay.");
    if (!Number.isFinite(n) || n <= 0) return setError("Enter an amount above 0.");
    if (n > calc.balance) return setError(`The amount can’t be more than the balance (${idr(calc.balance)}).`);
    if (!date) return setError("Pick a payment date.");
    setError(undefined);
    onSubmit({ orderId, date, amount: Math.round(n), method, ref: ref.trim() });
  }

  return (
    <Modal title="Record payment" onClose={onClose}>
      {payable.length === 0 ? (
        <p className="rounded-xl bg-[#ff9d66]/15 px-4 py-6 text-center text-sm font-semibold">Every order is fully paid. Nothing to record.</p>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4">
          <Field id="p-order" label="Order">
            <select id="p-order" value={orderId} onChange={(e) => pickOrder(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {payable.map((c) => (
                <option key={c.order.id} value={c.order.id}>
                  {c.order.number} · {customer(c.order.customerId)} · {idr(c.balance)} due
                </option>
              ))}
            </select>
          </Field>

          {calc && (
            <div className="flex flex-wrap justify-between gap-2 rounded-xl bg-[#ff9d66]/15 px-4 py-3 text-sm font-semibold">
              <span>
                Total <b className="font-black">{idr(calc.total)}</b>
              </span>
              <span>
                Paid <b className="font-black">{idr(calc.paid)}</b>
              </span>
              <span>
                Balance <b className="font-black">{idr(calc.balance)}</b>
              </span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="p-amount" label="Amount (Rp)">
              <input id="p-amount" type="number" min={1} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls(!!error)} />
            </Field>
            <Field id="p-date" label="Payment date">
              <input id="p-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls()} />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-bold">Method</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Payment method">
              {methods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={method === m.value}
                  onClick={() => setMethod(m.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${
                    method === m.value ? "border-[#1f1218] bg-[#1f1218] text-white" : "border-[#1f1218]/15 hover:bg-[#ff9d66]/25"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <Field id="p-ref" label="Reference (optional)">
            <input id="p-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. TRF-8841" className={fieldCls()} />
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
              Save payment
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
