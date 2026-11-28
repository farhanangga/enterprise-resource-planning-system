"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/dashboard/app-context";
import { Empty, Kpi, Pager, SearchBox, Select } from "@/components/purchasing/parts";
import Chip from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnGhost, btnPrimary } from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import EmployeeModal, { type EmployeePayload } from "./EmployeeModal";
import { addDays, annualUsed, attMeta, fmtDate, fmtDay, idr, initials, isWeekend, leaveDays, leaveMeta, leaveTypeLabel, minutesOf, onLeave, payrollOf, tenure } from "./helpers";
import LeaveModal, { type LeavePayload } from "./LeaveModal";
import type { AttStatus, Employee, HrData, LeaveRequest, LeaveStatus } from "./types";

type Tab = "employees" | "attendance" | "leave" | "payroll";
type EmpFilter = "all" | "active" | "on_leave" | "inactive";

function Avatar({ name }: { name: string }) {
  return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff9d66]/30 text-xs font-black">{initials(name)}</span>;
}

export default function HrView({ data }: { data: HrData }) {
  const { user, can, role, roleInfo } = useApp();

  const [employees, setEmployees] = useState<Employee[]>(data.employees);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(data.leaves);
  const [tab, setTab] = useState<Tab | null>(null);

  const [q, setQ] = useState("");
  const [deptF, setDeptF] = useState("all");
  const [statusF, setStatusF] = useState<EmpFilter>("all");
  const [page, setPage] = useState(1);
  const [attDate, setAttDate] = useState(data.today);
  const [leaveF, setLeaveF] = useState<"all" | LeaveStatus>("all");
  const [lpage, setLpage] = useState(1);
  const [paid, setPaid] = useState<{ date: string; by: string } | null>(null);
  const [confirmPay, setConfirmPay] = useState(false);

  const [empModal, setEmpModal] = useState<{ id?: string } | null>(null);
  const [leaveModal, setLeaveModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const canView = can("hr:view");
  const canManage = can("hr:manage");
  const canPayroll = can("hr:payroll");

  const tabs: { id: Tab; label: string }[] = [
    { id: "employees", label: "Employees" },
    { id: "attendance", label: "Attendance" },
    { id: "leave", label: "Leave" },
    ...(canPayroll ? [{ id: "payroll" as Tab, label: "Payroll" }] : []),
  ];
  const active: Tab = tab && tabs.some((t) => t.id === tab) ? tab : "employees";

  const empOf = (id: string) => employees.find((e) => e.id === id);
  const todayLeave = (e: Employee) => onLeave(e.id, data.today, leaves);
  const activeEmps = employees.filter((e) => e.status === "active");

  /* ---------- KPI ---------- */
  const todayRecs = data.attendance.filter((a) => a.date === data.today && empOf(a.employeeId)?.status === "active");
  const presentToday = todayRecs.filter((a) => a.status !== "absent").length;
  const lateToday = todayRecs.filter((a) => a.status === "late").length;
  const onLeaveToday = activeEmps.filter((e) => todayLeave(e)).length;
  const pending = leaves.filter((l) => l.status === "pending").length;
  const payroll = useMemo(() => activeEmps.map((e) => payrollOf(e, leaves, data)), [activeEmps, leaves, data]);
  const netTotal = payroll.reduce((s, r) => s + r.net, 0);

  const kpis: { icon: IconName; label: string; value: string; note: string }[] = [
    { icon: "hr", label: "Active employees", value: String(activeEmps.length), note: `${employees.length - activeEmps.length} inactive` },
    { icon: "check", label: "Present today", value: `${presentToday} of ${activeEmps.length - onLeaveToday}`, note: lateToday > 0 ? `${lateToday} arrived late` : "No late arrivals" },
    { icon: "clock", label: "On leave today", value: String(onLeaveToday), note: onLeaveToday === 1 ? "1 person away" : `${onLeaveToday} people away` },
    { icon: "alert", label: "Pending leave requests", value: String(pending), note: pending > 0 ? "Waiting for a decision" : "All requests handled" },
    ...(canPayroll ? [{ icon: "finance" as IconName, label: `Payroll · ${data.period.label}`, value: idr(netTotal), note: "Net pay for active employees" }] : []),
  ];
  const kpiCols: Record<number, string> = { 4: "xl:grid-cols-4", 5: "xl:grid-cols-5" };

  /* ---------- karyawan ---------- */
  const statusOf = (e: Employee): Exclude<EmpFilter, "all"> => (e.status === "inactive" ? "inactive" : todayLeave(e) ? "on_leave" : "active");
  const searched = useMemo(() => {
    const t = q.trim().toLowerCase();
    return employees.filter((e) => (deptF === "all" || e.department === deptF) && (!t || e.name.toLowerCase().includes(t) || e.position.toLowerCase().includes(t)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, q, deptF, leaves]);
  const empCounts = useMemo(() => {
    const c: Record<EmpFilter, number> = { all: searched.length, active: 0, on_leave: 0, inactive: 0 };
    searched.forEach((e) => c[statusOf(e)]++);
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched, leaves]);
  const empRows = useMemo(
    () => searched.filter((e) => statusF === "all" || statusOf(e) === statusF).sort((a, b) => a.name.localeCompare(b.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, statusF, leaves],
  );
  const eCurrent = Math.min(page, Math.max(1, Math.ceil(empRows.length / data.pageSize)));
  const empPage = empRows.slice((eCurrent - 1) * data.pageSize, eCurrent * data.pageSize);

  /* ---------- absensi ---------- */
  const weekend = isWeekend(attDate);
  const attRows = activeEmps
    .map((e) => {
      const lv = onLeave(e.id, attDate, leaves);
      const rec = data.attendance.find((a) => a.employeeId === e.id && a.date === attDate);
      const state: AttStatus | "leave" | "none" = lv ? "leave" : (rec?.status ?? "none");
      return { e, rec, state, lv };
    })
    .sort((a, b) => a.e.name.localeCompare(b.e.name));
  const attSummary = {
    present: attRows.filter((r) => r.state === "present").length,
    late: attRows.filter((r) => r.state === "late").length,
    leave: attRows.filter((r) => r.state === "leave").length,
    absent: attRows.filter((r) => r.state === "absent").length,
  };
  const hours = (inT?: string, outT?: string) => (inT && outT ? `${((minutesOf(outT) - minutesOf(inT)) / 60).toFixed(1)} h` : "—");
  const lateBy = (inT?: string) => (inT ? minutesOf(inT) - minutesOf(data.workStart) : 0);

  /* ---------- cuti ---------- */
  const leaveCounts = useMemo(() => {
    const c: Record<"all" | LeaveStatus, number> = { all: leaves.length, pending: 0, approved: 0, rejected: 0 };
    leaves.forEach((l) => c[l.status]++);
    return c;
  }, [leaves]);
  const leaveRows = useMemo(
    () =>
      leaves
        .filter((l) => leaveF === "all" || l.status === leaveF)
        .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.from.localeCompare(a.from)),
    [leaves, leaveF],
  );
  const lCurrent = Math.min(lpage, Math.max(1, Math.ceil(leaveRows.length / data.pageSize)));
  const leavePage = leaveRows.slice((lCurrent - 1) * data.pageSize, lCurrent * data.pageSize);
  const year = data.today.slice(0, 4);

  /* ---------- aksi ---------- */
  // Catatan produksi: simpan lewat API dan cek izin di server (terutama gaji).
  function saveEmployee(p: EmployeePayload) {
    if (empModal?.id) {
      setEmployees(employees.map((e) => (e.id === empModal.id ? { ...e, ...p } : e)));
      setToast(`${p.name} updated`);
    } else {
      setEmployees([{ id: `e${Date.now()}`, ...p }, ...employees]);
      setPage(1);
      setToast(`${p.name} added`);
    }
    setEmpModal(null);
  }

  function requestLeave(p: LeavePayload) {
    const l: LeaveRequest = { id: `l${Date.now()}`, ...p, status: "pending", requestedOn: data.today };
    setLeaves([l, ...leaves]);
    setLeaveModal(false);
    setLeaveF("pending");
    setLpage(1);
    setToast(`Leave request for ${empOf(p.employeeId)?.name ?? "employee"} submitted`);
  }

  function decide(id: string, status: Exclude<LeaveStatus, "pending">) {
    const l = leaves.find((x) => x.id === id);
    setLeaves(leaves.map((x) => (x.id === id ? { ...x, status, decidedBy: user.name } : x)));
    setToast(`Leave ${status === "approved" ? "approved" : "rejected"} for ${empOf(l?.employeeId ?? "")?.name ?? "employee"}`);
  }

  function markPaid() {
    setPaid({ date: data.today, by: user.name });
    setConfirmPay(false);
    setToast(`${data.period.label} payroll marked as paid`);
  }

  /* ---------- tanpa akses ---------- */
  if (!canView) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <Reveal variant="scale">
          <div className="rounded-[28px] border border-[#1f1218]/10 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ff9d66]/25">
              <Icon name="shield" className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-black tracking-tight">No access to HR</h1>
            <p className="mt-2 text-[#5d4a52]">The {roleInfo[role].label} role can’t open this page. Ask an Owner or Admin if you need access.</p>
            <Link href="/dashboard/main" className={`${btnPrimary} mt-6`}>
              Back to dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const empChips: [EmpFilter, string][] = [["all", "All"], ["active", "Active"], ["on_leave", "On leave"], ["inactive", "Inactive"]];
  const leaveChips: ["all" | LeaveStatus, string][] = [["all", "All"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]];
  const editing = empModal?.id ? empOf(empModal.id) : undefined;
  const th = "text-xs font-bold uppercase tracking-wider text-[#5d4a52]";
  const chipBtn = (on: boolean) =>
    `flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${on ? "bg-[#1f1218] text-white" : "bg-[#1f1218]/[0.06] text-[#1f1218] hover:bg-[#ff9d66]/30"}`;
  const chipCount = (on: boolean) => `rounded-full px-1.5 text-[11px] ${on ? "bg-white/20" : "bg-white"}`;

  return (
    <div className="mx-auto grid max-w-[1320px] gap-5">
      {/* judul + aksi */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">HR</h1>
            <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
            <p className="mt-3 max-w-xl text-[#5d4a52]">Keep your team’s details, attendance, leave, and pay in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canManage && (
              <>
                <button type="button" onClick={() => setLeaveModal(true)} className={btnGhost}>
                  <Icon name="clock" className="h-4 w-4" />
                  New leave request
                </button>
                <button type="button" onClick={() => setEmpModal({})} className={btnPrimary}>
                  <Icon name="plus" className="h-4 w-4" />
                  Add employee
                </button>
              </>
            )}
            {!canManage && <Chip tone="soft">View only</Chip>}
          </div>
        </div>
      </Reveal>

      {/* KPI */}
      <div className={`grid gap-4 sm:grid-cols-2 ${kpiCols[kpis.length] ?? "xl:grid-cols-4"}`}>
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={60 + i * 60} className="h-full">
            <Kpi {...k} />
          </Reveal>
        ))}
      </div>

      {/* tab */}
      <Reveal delay={150}>
        <div role="tablist" aria-label="HR sections" className="inline-flex flex-wrap gap-1 rounded-full bg-[#1f1218]/[0.06] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              onClick={() => (setTab(t.id), setConfirmPay(false))}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${active === t.id ? "bg-[#1f1218] text-white" : "text-[#5d4a52] hover:text-[#1f1218]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* ===== KARYAWAN ===== */}
      {active === "employees" && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label="Search employees" value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Search name or job title…" />
              <Select label="Department" value={deptF} onChange={(v) => (setDeptF(v), setPage(1))}>
                <option value="all">All departments</option>
                {data.departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#1f1218]/10 px-4 py-3 sm:px-5">
              {empChips.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={statusF === id} onClick={() => (setStatusF(id), setPage(1))} className={chipBtn(statusF === id)}>
                  {label}
                  <span className={chipCount(statusF === id)}>{empCounts[id]}</span>
                </button>
              ))}
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className={th}>
                    <th className="py-3 pl-5 pr-3">Employee</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Joined</th>
                    <th className="px-3 py-3">Contact</th>
                    {canPayroll && <th className="px-3 py-3 text-right">Base salary</th>}
                    <th className="py-3 pl-3 pr-5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {empPage.map((e) => {
                    const st = statusOf(e);
                    return (
                      <tr key={e.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <span className="flex items-center gap-3">
                            <Avatar name={e.name} />
                            <span className="leading-tight">
                              <b className="block">{e.name}</b>
                              <span className="text-xs text-[#5d4a52]">{e.position}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3">{e.department}</td>
                        <td className="px-3 py-3">
                          <Chip tone={st === "active" ? "brown" : st === "on_leave" ? "orange" : "soft"}>{st === "active" ? "Active" : st === "on_leave" ? "On leave" : "Inactive"}</Chip>
                        </td>
                        <td className="px-3 py-3">
                          <span className="block">{fmtDate(e.joined)}</span>
                          <span className="text-xs text-[#5d4a52]">{tenure(e.joined, data.today)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="block">{e.phone || "—"}</span>
                          <span className="text-xs text-[#5d4a52]">{e.email}</span>
                        </td>
                        {canPayroll && <td className="px-3 py-3 text-right font-bold tabular-nums">{e.baseSalary > 0 ? idr(e.baseSalary) : "—"}</td>}
                        <td className="py-3 pl-3 pr-5">
                          <div className="flex justify-end">
                            {canManage && (
                              <button type="button" onClick={() => setEmpModal({ id: e.id })} className="rounded-full border border-[#1f1218]/15 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 hover:bg-[#ff9d66]/30">
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {empRows.length === 0 && <Empty title="No employees found" text="Try a different search or clear the filters." onClear={() => (setQ(""), setDeptF("all"), setStatusF("all"), setPage(1))} />}
            </div>
            <Pager page={page} size={data.pageSize} total={empRows.length} onPage={setPage} />
          </section>
        </Reveal>
      )}

      {/* ===== ABSENSI ===== */}
      {active === "attendance" && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Previous day" onClick={() => setAttDate(addDays(attDate, -1))} className="grid h-10 w-10 place-items-center rounded-full border border-[#1f1218]/15 transition-colors duration-200 hover:bg-[#ff9d66]/30">
                  <Icon name="arrow" className="h-4 w-4 rotate-180" />
                </button>
                <label className="sr-only" htmlFor="att-date">
                  Date
                </label>
                <input id="att-date" type="date" value={attDate} max={data.today} onChange={(e) => e.target.value && setAttDate(e.target.value)} className="h-10 rounded-full border border-[#1f1218]/10 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#ff9d66] focus:ring-4 focus:ring-[#ff9d66]/25" />
                <button type="button" aria-label="Next day" disabled={attDate >= data.today} onClick={() => setAttDate(addDays(attDate, 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[#1f1218]/15 transition-colors duration-200 hover:bg-[#ff9d66]/30 disabled:pointer-events-none disabled:opacity-40">
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm font-semibold text-[#5d4a52]">{fmtDay(attDate)}</p>
              {!weekend && (
                <p className="flex flex-wrap gap-2 sm:ml-auto">
                  <Chip tone="brown">{attSummary.present} present</Chip>
                  <Chip tone="orange">{attSummary.late} late</Chip>
                  <Chip tone="soft">{attSummary.leave} on leave</Chip>
                  <Chip tone="red">{attSummary.absent} absent</Chip>
                </p>
              )}
            </div>
            {weekend ? (
              <div className="border-t border-[#1f1218]/10">
                <Empty title="Weekend" text="Attendance is only recorded on working days (Monday to Friday)." />
              </div>
            ) : (
              <div className="overflow-x-auto border-t border-[#1f1218]/10">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className={th}>
                      <th className="py-3 pl-5 pr-3">Employee</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Clock in</th>
                      <th className="px-3 py-3">Clock out</th>
                      <th className="py-3 pl-3 pr-5 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attRows.map(({ e, rec, state, lv }) => (
                      <tr key={e.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <span className="flex items-center gap-3">
                            <Avatar name={e.name} />
                            <span className="leading-tight">
                              <b className="block">{e.name}</b>
                              <span className="text-xs text-[#5d4a52]">{e.department}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {state === "none" ? <span className="text-[#5d4a52]">No record</span> : <Chip tone={attMeta[state].tone}>{attMeta[state].label}</Chip>}
                          {state === "late" && <span className="ml-2 text-xs text-[#5d4a52]">+{lateBy(rec?.in)} min</span>}
                          {lv && <span className="ml-2 text-xs text-[#5d4a52]">{leaveTypeLabel[lv.type]} leave</span>}
                        </td>
                        <td className="px-3 py-3 tabular-nums">{rec?.in ?? "—"}</td>
                        <td className="px-3 py-3 tabular-nums">{rec?.out ?? (rec?.in && attDate === data.today ? <span className="text-xs text-[#5d4a52]">Still working</span> : "—")}</td>
                        <td className="py-3 pl-3 pr-5 text-right tabular-nums">{hours(rec?.in, rec?.out)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Reveal>
      )}

      {/* ===== CUTI ===== */}
      {active === "leave" && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-5">
              {leaveChips.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={leaveF === id} onClick={() => (setLeaveF(id), setLpage(1))} className={chipBtn(leaveF === id)}>
                  {label}
                  <span className={chipCount(leaveF === id)}>{leaveCounts[id]}</span>
                </button>
              ))}
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className={th}>
                    <th className="py-3 pl-5 pr-3">Employee</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Dates</th>
                    <th className="px-3 py-3">Reason</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="py-3 pl-3 pr-5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leavePage.map((l) => {
                    const e = empOf(l.employeeId);
                    const days = leaveDays(l);
                    const left = e ? data.annualQuota - annualUsed(e.id, leaves, year) : 0;
                    const over = l.status === "pending" && l.type === "annual" && days > left;
                    return (
                      <tr key={l.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <span className="flex items-center gap-3">
                            <Avatar name={e?.name ?? "?"} />
                            <span className="leading-tight">
                              <b className="block">{e?.name ?? "Unknown"}</b>
                              <span className="text-xs text-[#5d4a52]">Requested {fmtDate(l.requestedOn)}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Chip tone="soft">{leaveTypeLabel[l.type]}</Chip>
                        </td>
                        <td className="px-3 py-3">
                          <span className="block whitespace-nowrap">{l.from === l.to ? fmtDate(l.from) : `${fmtDate(l.from)} – ${fmtDate(l.to)}`}</span>
                          <span className="text-xs text-[#5d4a52]">
                            {days} working day{days === 1 ? "" : "s"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[#5d4a52]">{l.reason || "—"}</td>
                        <td className="px-3 py-3">
                          <span className="flex flex-wrap items-center gap-1.5">
                            <Chip tone={leaveMeta[l.status].tone}>{leaveMeta[l.status].label}</Chip>
                            {over && <Chip tone="red">Over quota</Chip>}
                          </span>
                          {l.decidedBy && <span className="mt-1 block text-xs text-[#5d4a52]">by {l.decidedBy}</span>}
                        </td>
                        <td className="py-3 pl-3 pr-5">
                          <div className="flex justify-end gap-2">
                            {canManage && l.status === "pending" && (
                              <>
                                <button type="button" onClick={() => decide(l.id, "rejected")} className="rounded-full px-3.5 py-1.5 text-xs font-bold text-[#9f2a20] transition-colors duration-200 hover:bg-[#c8362b]/10">
                                  Reject
                                </button>
                                <button type="button" onClick={() => decide(l.id, "approved")} className="rounded-full bg-[#1f1218] px-3.5 py-1.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218]">
                                  Approve
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {leaveRows.length === 0 && <Empty title="No leave requests" text="Requests will show up here." />}
            </div>
            <Pager page={lpage} size={data.pageSize} total={leaveRows.length} onPage={setLpage} />
          </section>
        </Reveal>
      )}

      {/* ===== GAJI ===== */}
      {active === "payroll" && canPayroll && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-black">{data.period.label}</h2>
                <Chip tone={paid ? "brown" : "orange"}>{paid ? `Paid on ${fmtDate(paid.date)}` : "Not paid yet"}</Chip>
              </div>
              {!paid &&
                (confirmPay ? (
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    Mark {idr(netTotal)} as paid?
                    <button type="button" onClick={markPaid} className="rounded-full bg-[#1f1218] px-4 py-1.5 text-xs font-bold text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218]">
                      Yes, mark as paid
                    </button>
                    <button type="button" onClick={() => setConfirmPay(false)} className="rounded-full px-3 py-1.5 text-xs font-bold transition-colors duration-200 hover:bg-[#1f1218]/[0.08]">
                      Not yet
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmPay(true)} className={btnPrimary}>
                    <Icon name="check" className="h-4 w-4" />
                    Mark as paid
                  </button>
                ))}
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className={th}>
                    <th className="py-3 pl-5 pr-3">Employee</th>
                    <th className="px-3 py-3 text-right">Base salary</th>
                    <th className="px-3 py-3 text-right">Allowance</th>
                    <th className="px-3 py-3 text-right">Deductions</th>
                    <th className="py-3 pl-3 pr-5 text-right">Net pay</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((r) => (
                    <tr key={r.employee.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                      <td className="py-3 pl-5 pr-3">
                        <span className="flex items-center gap-3">
                          <Avatar name={r.employee.name} />
                          <span className="leading-tight">
                            <b className="block">{r.employee.name}</b>
                            <span className="text-xs text-[#5d4a52]">{r.employee.position}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{idr(r.employee.baseSalary)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{idr(r.employee.allowance)}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span className="block">− {idr(r.social + r.unpaid)}</span>
                        <span className="text-xs text-[#5d4a52]">
                          Social security {idr(r.social)}
                          {r.unpaidDays > 0 ? ` · ${r.unpaidDays} unpaid day${r.unpaidDays === 1 ? "" : "s"} ${idr(r.unpaid)}` : ""}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right font-black tabular-nums">{idr(r.net)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#1f1218]/20 bg-[#1f1218]/[0.04] font-black">
                    <td className="py-3 pl-5 pr-3">Total · {payroll.length} employees</td>
                    <td className="px-3 py-3 text-right tabular-nums">{idr(payroll.reduce((s, r) => s + r.employee.baseSalary, 0))}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{idr(payroll.reduce((s, r) => s + r.employee.allowance, 0))}</td>
                    <td className="px-3 py-3 text-right tabular-nums">− {idr(payroll.reduce((s, r) => s + r.social + r.unpaid, 0))}</td>
                    <td className="py-3 pl-3 pr-5 text-right tabular-nums">{idr(netTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="border-t border-[#1f1218]/10 px-5 py-3 text-xs font-semibold text-[#5d4a52]">
              Social security uses a flat {Math.round(data.socialRate * 100)}% of base salary and unpaid leave is deducted per working day. Income tax (PPh 21) isn’t calculated yet.
            </p>
          </section>
        </Reveal>
      )}

      {/* modal */}
      {empModal && (!empModal.id || editing) && (
        <EmployeeModal key={empModal.id ?? "new"} employee={editing} departments={data.departments} today={data.today} canSalary={canPayroll} onClose={() => setEmpModal(null)} onSubmit={saveEmployee} />
      )}
      {leaveModal && <LeaveModal employees={activeEmps} leaves={leaves} today={data.today} annualQuota={data.annualQuota} onClose={() => setLeaveModal(false)} onSubmit={requestLeave} />}

      {/* toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1f1218] px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#ff9d66] text-[#1f1218]">
          <Icon name="check" className="h-3 w-3" />
        </span>
        {toast}
      </div>
    </div>
  );
}
