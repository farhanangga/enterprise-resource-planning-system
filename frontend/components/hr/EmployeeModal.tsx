"use client";

import { useState } from "react";
import Modal, { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import type { EmpStatus, Employee } from "./types";

export type EmployeePayload = Omit<Employee, "id">;

type Props = {
  /** kosong = karyawan baru */
  employee?: Employee;
  departments: string[];
  today: string;
  /** true = boleh mengisi gaji (izin hr:payroll) */
  canSalary: boolean;
  onClose: () => void;
  onSubmit: (payload: EmployeePayload) => void;
};

export default function EmployeeModal({ employee, departments, today, canSalary, onClose, onSubmit }: Props) {
  const [name, setName] = useState(employee?.name ?? "");
  const [position, setPosition] = useState(employee?.position ?? "");
  const [department, setDepartment] = useState(employee?.department ?? departments[0] ?? "");
  const [status, setStatus] = useState<EmpStatus>(employee?.status ?? "active");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [joined, setJoined] = useState(employee?.joined ?? today);
  const [base, setBase] = useState(String(employee?.baseSalary ?? ""));
  const [allowance, setAllowance] = useState(String(employee?.allowance ?? ""));
  const [error, setError] = useState<string>();

  function submit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter the employee’s name.");
    if (!position.trim()) return setError("Enter a job title.");
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!joined) return setError("Pick the join date.");
    const b = Number(base || 0);
    const a = Number(allowance || 0);
    if (canSalary && (!Number.isFinite(b) || b < 0 || !Number.isFinite(a) || a < 0)) return setError("Salary and allowance can’t be negative.");
    setError(undefined);
    onSubmit({
      name: name.trim(),
      position: position.trim(),
      department,
      status,
      phone: phone.trim(),
      email: email.trim(),
      joined,
      baseSalary: canSalary ? Math.round(b) : (employee?.baseSalary ?? 0),
      allowance: canSalary ? Math.round(a) : (employee?.allowance ?? 0),
    });
  }

  return (
    <Modal title={employee ? "Edit employee" : "Add employee"} size="lg" onClose={onClose}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="e-name" label="Full name">
            <input id="e-name" value={name} onChange={(e) => setName(e.target.value)} className={fieldCls(!!error && !name.trim())} />
          </Field>
          <Field id="e-position" label="Job title">
            <input id="e-position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Sales Executive" className={fieldCls(!!error && !position.trim())} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="e-dept" label="Department">
            <select id="e-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className={`${fieldCls()} cursor-pointer`}>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field id="e-joined" label="Join date">
            <input id="e-joined" type="date" value={joined} onChange={(e) => setJoined(e.target.value)} className={fieldCls()} />
          </Field>
          <Field id="e-status" label="Status">
            <select id="e-status" value={status} onChange={(e) => setStatus(e.target.value as EmpStatus)} className={`${fieldCls()} cursor-pointer`}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="e-phone" label="Phone (optional)">
            <input id="e-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="0812-0000-0000" className={fieldCls()} />
          </Field>
          <Field id="e-email" label="Email (optional)">
            <input id="e-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@tokorina.id" className={fieldCls(!!error && !!email && !/^\S+@\S+\.\S+$/.test(email))} />
          </Field>
        </div>

        {canSalary ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="e-base" label="Base salary (Rp per month)">
              <input id="e-base" type="number" min={0} inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value)} className={fieldCls()} />
            </Field>
            <Field id="e-allow" label="Fixed allowance (Rp per month)">
              <input id="e-allow" type="number" min={0} inputMode="numeric" value={allowance} onChange={(e) => setAllowance(e.target.value)} className={fieldCls()} />
            </Field>
          </div>
        ) : (
          <p className="rounded-xl bg-[#ff9d66]/15 px-4 py-2.5 text-xs font-semibold text-[#5d4a52]">Salary is set by someone with payroll access. {employee ? "It stays as it is." : "This employee starts with no salary on file."}</p>
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
          <button type="submit" className={btnPrimary}>
            {employee ? "Save changes" : "Add employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
