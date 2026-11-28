import type { Metadata } from "next";
import HrView from "@/components/hr/HrView";
import { onLeave } from "@/components/hr/helpers";
import type { Attendance, Employee, HrData, LeaveRequest } from "@/components/hr/types";

export const metadata: Metadata = {
  title: "HR – ETERA",
  description: "Employees, attendance, leave, and payroll.",
};

/* =====================================================================
   DATA HALAMAN HR (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/dashboard/layout.tsx.
   Izin yang dipakai halaman ini:
   - hr:view     → boleh membuka halaman (karyawan, absensi, cuti)
   - hr:manage   → tambah/ubah karyawan, ajukan dan putuskan cuti
   - hr:payroll  → melihat gaji dan tab Payroll
   Catatan: hanya untuk prototipe. Perubahan tidak tersimpan (hilang saat
   halaman dimuat ulang). Gaji adalah data sensitif: untuk produksi, ambil
   dari API dan cek izin di server, jangan kirim ke peran yang tidak berhak.
   ===================================================================== */

const employees: Employee[] = [
  { id: "e1", name: "Rina Pratama", position: "Owner", department: "Management", status: "active", phone: "0812-1000-0001", email: "owner@etera.app", joined: "2022-03-01", baseSalary: 15000000, allowance: 2000000 },
  { id: "e2", name: "Budi Santoso", position: "Operations Manager", department: "Operations", status: "active", phone: "0812-1000-0002", email: "admin@etera.app", joined: "2022-08-15", baseSalary: 12000000, allowance: 1500000 },
  { id: "e3", name: "Dewi Anggraini", position: "Sales & Purchasing Manager", department: "Sales", status: "active", phone: "0813-1000-0003", email: "manager@etera.app", joined: "2023-01-09", baseSalary: 9500000, allowance: 1200000 },
  { id: "e4", name: "Dedi Kurniawan", position: "Accountant", department: "Finance", status: "active", phone: "0813-1000-0004", email: "finance@etera.app", joined: "2023-04-03", baseSalary: 8500000, allowance: 1000000 },
  { id: "e5", name: "Sari Wulandari", position: "Warehouse & Cashier", department: "Warehouse", status: "active", phone: "0857-1000-0005", email: "staff@etera.app", joined: "2024-02-12", baseSalary: 5200000, allowance: 800000 },
  { id: "e6", name: "Agus Setiawan", position: "Warehouse Staff", department: "Warehouse", status: "active", phone: "0857-1000-0006", email: "agus@tokorina.id", joined: "2024-06-17", baseSalary: 4800000, allowance: 700000 },
  { id: "e7", name: "Lina Marlina", position: "Cashier", department: "Store", status: "active", phone: "0821-1000-0007", email: "lina@tokorina.id", joined: "2024-09-02", baseSalary: 4800000, allowance: 700000 },
  { id: "e8", name: "Rizky Ramadhan", position: "Delivery Driver", department: "Operations", status: "active", phone: "0821-1000-0008", email: "rizky@tokorina.id", joined: "2025-01-20", baseSalary: 4900000, allowance: 900000 },
  { id: "e9", name: "Maya Puspita", position: "Sales Executive", department: "Sales", status: "active", phone: "0878-1000-0009", email: "maya@tokorina.id", joined: "2025-03-10", baseSalary: 6000000, allowance: 1000000 },
  { id: "e10", name: "Yoga Pratama", position: "Sales Executive", department: "Sales", status: "active", phone: "0878-1000-0010", email: "yoga@tokorina.id", joined: "2025-07-01", baseSalary: 6000000, allowance: 1000000 },
  { id: "e11", name: "Nia Kurniasih", position: "Barista & Packing", department: "Store", status: "active", phone: "0895-1000-0011", email: "nia@tokorina.id", joined: "2025-10-06", baseSalary: 4500000, allowance: 600000 },
  { id: "e12", name: "Fajar Nugroho", position: "Warehouse Staff", department: "Warehouse", status: "inactive", phone: "0895-1000-0012", email: "fajar@tokorina.id", joined: "2023-11-20", baseSalary: 4800000, allowance: 700000 },
];

// jumlah hari cuti dihitung otomatis dari tanggal (hari kerja Sen–Jum)
const leaves: LeaveRequest[] = [
  { id: "l1", employeeId: "e6", type: "annual", from: "2026-11-26", to: "2026-11-27", reason: "Family event", status: "approved", requestedOn: "2026-11-18", decidedBy: "Budi Santoso" },
  { id: "l2", employeeId: "e9", type: "annual", from: "2026-12-14", to: "2026-12-18", reason: "Family trip", status: "pending", requestedOn: "2026-11-25" },
  { id: "l3", employeeId: "e5", type: "sick", from: "2026-11-17", to: "2026-11-18", reason: "Flu", status: "approved", requestedOn: "2026-11-17", decidedBy: "Budi Santoso" },
  { id: "l4", employeeId: "e7", type: "unpaid", from: "2026-11-09", to: "2026-11-10", reason: "Family matter", status: "approved", requestedOn: "2026-11-04", decidedBy: "Budi Santoso" },
  { id: "l5", employeeId: "e10", type: "annual", from: "2026-12-24", to: "2026-12-31", reason: "Year-end holiday", status: "pending", requestedOn: "2026-11-26" },
  { id: "l6", employeeId: "e11", type: "other", from: "2026-12-07", to: "2026-12-07", reason: "Personal errand", status: "rejected", requestedOn: "2026-11-24", decidedBy: "Budi Santoso" },
  { id: "l7", employeeId: "e8", type: "annual", from: "2026-10-12", to: "2026-10-16", reason: "Hometown visit", status: "approved", requestedOn: "2026-09-28", decidedBy: "Budi Santoso" },
  { id: "l8", employeeId: "e3", type: "annual", from: "2026-08-17", to: "2026-08-21", reason: "Vacation", status: "approved", requestedOn: "2026-07-30", decidedBy: "Rina Pratama" },
  { id: "l9", employeeId: "e4", type: "annual", from: "2026-12-21", to: "2026-12-23", reason: "Year-end", status: "pending", requestedOn: "2026-11-27" },
];

/* Absensi 5 hari kerja terakhir dibuat otomatis dengan pola tetap (bukan acak),
   supaya data contoh selalu sama. Karyawan yang sedang cuti tidak dibuatkan catatan. */
const days = ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27"];
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function buildAttendance(): Attendance[] {
  const out: Attendance[] = [];
  const actives = employees.filter((e) => e.status === "active");
  days.forEach((date, d) => {
    actives.forEach((e, i) => {
      if (onLeave(e.id, date, leaves)) return;
      const k = (i * 5 + d * 3) % 17;
      if (k === 0) return void out.push({ employeeId: e.id, date, status: "absent" });
      const late = k === 1 || k === 2;
      const inMin = late ? 9 * 60 + 5 + k * 6 : 8 * 60 + 38 + (k % 6) * 3;
      const outMin = 17 * 60 + (k % 4) * 6;
      out.push({ employeeId: e.id, date, status: late ? "late" : "present", in: hhmm(inMin), out: date === "2026-11-27" ? undefined : hhmm(outMin) });
    });
  });
  return out;
}

const data: HrData = {
  today: "2026-11-27", // dianggap "hari ini"
  pageSize: 8,
  workStart: "09:00",
  annualQuota: 12, // hari kerja per tahun
  workingDays: 22, // hari kerja per bulan (untuk potongan cuti tanpa gaji)
  socialRate: 0.04, // potongan jaminan sosial karyawan. Sesuaikan dengan aturan BPJS yang berlaku.
  period: { month: "2026-11", label: "November 2026" },
  departments: ["Management", "Operations", "Sales", "Finance", "Warehouse", "Store"],
  employees,
  leaves,
  attendance: buildAttendance(),
};

export default function HrPage() {
  return <HrView data={data} />;
}
