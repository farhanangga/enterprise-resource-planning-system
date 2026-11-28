export type EmpStatus = "active" | "inactive";
export type LeaveType = "annual" | "sick" | "unpaid" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type AttStatus = "present" | "late" | "absent";

export type Employee = {
  id: string;
  name: string;
  position: string;
  department: string;
  status: EmpStatus; // "On leave" tidak disimpan, dihitung dari cuti yang disetujui
  phone: string;
  email: string;
  joined: string; // YYYY-MM-DD
  baseSalary: number; // gaji pokok per bulan (Rp)
  allowance: number; // tunjangan tetap per bulan (Rp)
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  type: LeaveType;
  from: string;
  to: string; // jumlah hari = hari kerja (Sen–Jum) dari `from` sampai `to`
  reason: string;
  status: LeaveStatus;
  requestedOn: string;
  decidedBy?: string;
};

export type Attendance = { employeeId: string; date: string; status: AttStatus; in?: string; out?: string };

export type PayrollRow = {
  employee: Employee;
  gross: number;
  social: number;
  unpaidDays: number;
  unpaid: number;
  net: number;
};

export type HrData = {
  today: string;
  pageSize: number;
  workStart: string; // jam masuk, mis. "09:00"
  annualQuota: number; // jatah cuti tahunan (hari kerja)
  workingDays: number; // hari kerja per bulan, untuk potongan cuti tanpa gaji
  socialRate: number; // potongan jaminan sosial (BPJS) karyawan, mis. 0.04
  period: { month: string; label: string }; // bulan gaji, mis. { month: "2026-11", label: "November 2026" }
  departments: string[];
  employees: Employee[];
  leaves: LeaveRequest[];
  attendance: Attendance[];
};
