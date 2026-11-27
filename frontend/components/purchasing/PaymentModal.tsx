"use client";

import { useState } from "react";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import { idr } from "./helpers";
import type { PayMethod, PoCalc, Supplier } from "./types";

export type PaymentPayload = { poId: string; date: string; amount: number; method: PayMethod; ref: string };

type Props = {
  /** PO yang masih punya sisa tagihan */
  payable: PoCalc[];
  suppliers: Supplier[];
  methods: { value: PayMethod; label: string }[];
  today: string;
  initialPoId?: string;
  onClose: () => void;
  onSubmit: (payload: PaymentPayload) => void;
};

export default function PaymentModal({ payable, suppliers, methods, today, initialPoId, onClose, onSubmit }: Props) {
  const first = initialPoId && payable.some((c) => c.order.id === initialPoId) ? initialPoId : (payable[0]?.order.id ?? "");
  const [poId, setPoId] = useState(first);
  const [amount, setAmount] = useState(() => String(payable.find((c) => c.order.id === first)?.balance ?? ""));
  const [method, setMethod] = useState<PayMethod>(methods[0]?.value ?? "transfer");
  const [date, setDate] = useState(today);
  const [ref, setRef] = useState("");
  const [error, setError] = useState<string>();

  const calc = payable.find((c) => c.order.id === poId);
  const supplier = (id: string) => suppliers.find((s) => s.id === id)?.name ?? "";
  const n = Number(amount);

  function pickPo(id: string) {
    setPoId(id);
    setAmount(String(payable.find((c) => c.order.id === id)?.balance ?? ""));
  }

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!calc) return setError("Choose a purchase order to pay.");
    if (!Number.isFinite(n) || n <= 0) return setError("Enter an amount above 0.");
    if (n > calc.balance) return setError(`The amount can’t be more than the balance (${idr(calc.balance)}).`);
    if (!date) return setError("Pick a payment date.");
    setError(undefined);
    onSubmit({ poId, date, amount: Math.round(n), method, ref: ref.trim() });
  }

  return (
    <Modal title="Pay supplier" onClose={onClose}>
      {payable.length === 0 ? (
        <p className="rounded-xl bg-[#ff9d66]/15 px-4 py-6 text-center text-sm font-semibold">Every supplier bill is paid. Nothing to record.</p>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4">
          <Field id="sp-po" label="Purchase order">
            <select id="sp-po" value={poId} onChange={(e) => pickPo(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {payable.map((c) => (
                <option key={c.order.id} value={c.order.id}>
                  {c.order.number} · {supplier(c.order.supplierId)} · {idr(c.balance)} due
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
            <Field id="sp-amount" label="Amount (Rp)">
              <input id="sp-amount" type="number" min={1} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls(!!error)} />
            </Field>
            <Field id="sp-date" label="Payment date">
              <input id="sp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls()} />
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

          <Field id="sp-ref" label="Reference (optional)">
            <input id="sp-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. TRF-9021" className={fieldCls()} />
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
