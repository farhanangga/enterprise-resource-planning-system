"use client";

import { useState } from "react";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import { annualUsed, leaveDays, leaveTypeLabel } from "./helpers";
import type { Employee, LeaveRequest, LeaveType } from "./types";

export type LeavePayload = { employeeId: string; type: LeaveType; from: string; to: string; reason: string };

type Props = {
  employees: Employee[];
  leaves: LeaveRequest[];
  today: string;
  annualQuota: number;
  onClose: () => void;
  onSubmit: (payload: LeavePayload) => void;
};

export default function LeaveModal({ employees, leaves, today, annualQuota, onClose, onSubmit }: Props) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id ?? "");
  const [type, setType] = useState<LeaveType>("annual");
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  const days = from && to && to >= from ? leaveDays({ from, to }) : 0;
  const left = Math.max(annualQuota - annualUsed(employeeId, leaves, today.slice(0, 4)), 0);

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!employeeId) return setError("Choose an employee.");
    if (!from || !to) return setError("Pick the first and last day of leave.");
    if (to < from) return setError("The last day can’t be before the first day.");
    if (days === 0) return setError("These dates fall on a weekend. Pick working days.");
    if (type === "annual" && days > left) return setError(`Only ${left} annual leave day${left === 1 ? "" : "s"} left this year.`);
    setError(undefined);
    onSubmit({ employeeId, type, from, to, reason: reason.trim() });
  }

  return (
    <Modal title="New leave request" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="l-emp" label="Employee">
            <select id="l-emp" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="l-type" label="Leave type" hint={type === "annual" ? `${left} of ${annualQuota} annual days left` : type === "unpaid" ? "Deducted from salary" : undefined}>
            <select id="l-type" value={type} onChange={(e) => setType(e.target.value as LeaveType)} className={`${fieldCls()} cursor-pointer`}>
              {(Object.keys(leaveTypeLabel) as LeaveType[]).map((t) => (
                <option key={t} value={t}>
                  {leaveTypeLabel[t]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="l-from" label="First day">
            <input id="l-from" type="date" value={from} onChange={(e) => (setFrom(e.target.value), to < e.target.value && setTo(e.target.value))} className={fieldCls()} />
          </Field>
          <Field id="l-to" label="Last day">
            <input id="l-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={fieldCls()} />
          </Field>
        </div>

        <p className="rounded-xl bg-[#ff9d66]/15 px-4 py-2.5 text-sm font-semibold">
          {days} working day{days === 1 ? "" : "s"} <span className="font-normal text-[#5d4a52]">(weekends aren’t counted)</span>
        </p>

        <Field id="l-reason" label="Reason (optional)">
          <input id="l-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Family trip" className={fieldCls()} />
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
            Submit request
          </button>
        </div>
      </form>
    </Modal>
  );
}
