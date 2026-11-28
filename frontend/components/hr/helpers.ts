import type { ChipTone } from "@/components/ui/Chip";
import type { AttStatus, Employee, HrData, LeaveRequest, LeaveStatus, LeaveType, PayrollRow } from "./types";

export const idr = (n: number) => `Rp ${new Intl.NumberFormat("id-ID").format(Math.round(n))}`;

export const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const fmtDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/* ---------- tanggal ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export const isWeekend = (iso: string) => [0, 6].includes(new Date(`${iso}T00:00:00`).getDay());

/** Jumlah hari kerja (Sen–Jum), tanggal awal dan akhir ikut dihitung */
export function weekdaysBetween(from: string, to: string) {
  let n = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) if (!isWeekend(d)) n++;
  return n;
}

export const leaveDays = (l: Pick<LeaveRequest, "from" | "to">) => weekdaysBetween(l.from, l.to);

export function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number) as [number, number];
  return { start: `${month}-01`, end: `${month}-${pad(new Date(y, m, 0).getDate())}` };
}

export function tenure(joined: string, today: string) {
  const a = new Date(`${joined}T00:00:00`);
  const b = new Date(`${today}T00:00:00`);
  const months = Math.max((b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth() - (b.getDate() < a.getDate() ? 1 : 0), 0);
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return m <= 1 ? "Under 2 months" : `${m} months`;
  return m === 0 ? `${y} yr${y === 1 ? "" : "s"}` : `${y} yr${y === 1 ? "" : "s"} ${m} mo`;
}

/* ---------- cuti ---------- */
export const onLeave = (empId: string, date: string, leaves: LeaveRequest[]) =>
  leaves.find((l) => l.employeeId === empId && l.status === "approved" && l.from <= date && date <= l.to);

export const annualUsed = (empId: string, leaves: LeaveRequest[], year: string) =>
  leaves.filter((l) => l.employeeId === empId && l.type === "annual" && l.status === "approved" && l.from.startsWith(year)).reduce((s, l) => s + leaveDays(l), 0);

/* ---------- absensi ---------- */
export const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  return h * 60 + m;
};

/* ---------- gaji ---------- */
// Prototipe: potongan jaminan sosial memakai tarif tetap dan PPh 21 belum dihitung.
export function payrollOf(e: Employee, leaves: LeaveRequest[], data: HrData): PayrollRow {
  const { start, end } = monthBounds(data.period.month);
  const unpaidDays = leaves
    .filter((l) => l.employeeId === e.id && l.type === "unpaid" && l.status === "approved" && l.from <= end && l.to >= start)
    .reduce((s, l) => s + weekdaysBetween(l.from > start ? l.from : start, l.to < end ? l.to : end), 0);
  const gross = e.baseSalary + e.allowance;
  const social = Math.round(e.baseSalary * data.socialRate);
  const unpaid = Math.round(e.baseSalary / data.workingDays) * unpaidDays;
  return { employee: e, gross, social, unpaidDays, unpaid, net: gross - social - unpaid };
}

/* ---------- label dan warna ---------- */
export const leaveTypeLabel: Record<LeaveType, string> = { annual: "Annual", sick: "Sick", unpaid: "Unpaid", other: "Other" };

export const leaveMeta: Record<LeaveStatus, { label: string; tone: ChipTone }> = {
  pending: { label: "Pending", tone: "orange" },
  approved: { label: "Approved", tone: "brown" },
  rejected: { label: "Rejected", tone: "red" },
};

export const attMeta: Record<AttStatus | "leave", { label: string; tone: ChipTone }> = {
  present: { label: "Present", tone: "brown" },
  late: { label: "Late", tone: "orange" },
  absent: { label: "Absent", tone: "red" },
  leave: { label: "On leave", tone: "soft" },
};
