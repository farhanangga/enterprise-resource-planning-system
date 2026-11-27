"use client";

import { useState } from "react";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import type { Account } from "./types";

export type TxnPayload = { type: "in" | "out"; accountId: string; date: string; amount: number; category: string; note: string };

type Props = {
  accounts: Account[];
  categories: { in: string[]; out: string[] };
  today: string;
  onClose: () => void;
  onSubmit: (payload: TxnPayload) => void;
};

export default function TransactionModal({ accounts, categories, today, onClose, onSubmit }: Props) {
  const [type, setType] = useState<"in" | "out">("out");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories.out[0] ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  function pickType(t: "in" | "out") {
    setType(t);
    setCategory(categories[t][0] ?? "");
  }

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    const n = Number(amount);
    if (!accountId) return setError("Choose an account.");
    if (!Number.isFinite(n) || n <= 0) return setError("Enter an amount above 0.");
    if (!date) return setError("Pick a date.");
    setError(undefined);
    onSubmit({ type, accountId, date, amount: Math.round(n), category, note: note.trim() });
  }

  return (
    <Modal title="New transaction" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div role="radiogroup" aria-label="Transaction type" className="grid grid-cols-2 gap-2">
          {(["out", "in"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={type === t}
              onClick={() => pickType(t)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors duration-200 ${
                type === t ? "border-[#1f1218] bg-[#1f1218] text-white" : "border-[#1f1218]/15 hover:bg-[#ff9d66]/25"
              }`}
            >
              {t === "out" ? "Money out" : "Money in"}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="t-account" label="Account">
            <select id="t-account" value={accountId} onChange={(e) => setAccountId(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="t-category" label="Category">
            <select id="t-category" value={category} onChange={(e) => setCategory(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {categories[type].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="t-amount" label="Amount (Rp)">
            <input id="t-amount" type="number" min={1} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={fieldCls(!!error && !amount)} />
          </Field>
          <Field id="t-date" label="Date">
            <input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldCls()} />
          </Field>
        </div>

        <Field id="t-note" label="Note (optional)">
          <input id="t-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Delivery fuel" className={fieldCls()} />
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
            Save transaction
          </button>
        </div>
      </form>
    </Modal>
  );
}
