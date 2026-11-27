"use client";

import { useState } from "react";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import { idr } from "./helpers";
import type { Account, DocCalc, DocKind } from "./types";

export type PaymentPayload = { docId: string; date: string; amount: number; accountId: string; ref: string };

type Props = {
  kind: DocKind;
  /** dokumen yang masih punya sisa */
  open: DocCalc[];
  accounts: Account[];
  today: string;
  initialDocId?: string;
  onClose: () => void;
  onSubmit: (payload: PaymentPayload) => void;
};

export default function PaymentModal({ kind, open, accounts, today, initialDocId, onClose, onSubmit }: Props) {
  const isInvoice = kind === "invoice";
  const first = initialDocId && open.some((c) => c.doc.id === initialDocId) ? initialDocId : (open[0]?.doc.id ?? "");
  const [docId, setDocId] = useState(first);
  const [amount, setAmount] = useState(() => String(open.find((c) => c.doc.id === first)?.balance ?? ""));
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [ref, setRef] = useState("");
  const [error, setError] = useState<string>();

  const calc = open.find((c) => c.doc.id === docId);
  const n = Number(amount);

  function pick(id: string) {
    setDocId(id);
    setAmount(String(open.find((c) => c.doc.id === id)?.balance ?? ""));
  }

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!calc) return setError(`Choose ${isInvoice ? "an invoice" : "a bill"}.`);
    if (!Number.isFinite(n) || n <= 0) return setError("Enter an amount above 0.");
    if (n > calc.balance) return setError(`The amount can’t be more than the balance (${idr(calc.balance)}).`);
    if (!accountId) return setError(`Choose the account ${isInvoice ? "that receives" : "you pay from"}.`);
    if (!date) return setError("Pick a payment date.");
    setError(undefined);
    onSubmit({ docId, date, amount: Math.round(n), accountId, ref: ref.trim() });
  }

  return (
    <Modal title={isInvoice ? "Record customer payment" : "Pay supplier bill"} onClose={onClose}>
      {open.length === 0 ? (
        <p className="rounded-xl bg-[#ff9d66]/15 px-4 py-6 text-center text-sm font-semibold">{isInvoice ? "Every invoice is paid." : "Every bill is paid."} Nothing to record.</p>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-4">
          <Field id="f-doc" label={isInvoice ? "Invoice" : "Bill"}>
            <select id="f-doc" value={docId} onChange={(e) => pick(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {open.map((c) => (
                <option key={c.doc.id} value={c.doc.id}>
                  {c.doc.number} · {c.doc.party} · {idr(c.balance)} due
                </option>
              ))}
            </select>
          </Field>

          {calc && (
            <div className="flex flex-wrap justify-between gap-2 rounded-xl bg-[#ff9d66]/15 px-4 py-3 text-sm font-semibold">
              <span>
                Total <b className="font-black">{idr(calc.doc.total)}</b>
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
            <Field id="f-amount" label="Amount (Rp)">
              <input id="f-amount" type="number" min={1} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls(!!error)} />
            </Field>
            <Field id="f-date" label="Payment date">
              <input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls()} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="f-account" label={isInvoice ? "Received into" : "Paid from"}>
              <select id="f-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="f-ref" label="Reference (optional)">
              <input id="f-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. TRF-9021" className={fieldCls()} />
            </Field>
          </div>

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
