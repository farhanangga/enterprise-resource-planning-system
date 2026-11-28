import type { IconName } from "@/components/ui/Icon";

export type Role = "owner" | "admin" | "manager" | "finance" | "staff";

export type Permission =
  // menu / modul
  | "dashboard:view"
  | "inventory:view"
  | "inventory:manage" // tambah / ubah produk
  | "inventory:adjust" // catat barang masuk / keluar / hitung stok
  | "inventory:cost" // lihat harga modal dan nilai stok
  | "sales:view"
  | "purchasing:view"
  | "purchasing:create" // membuat PO (tanpa purchasing:manage disimpan sebagai draft)
  | "purchasing:manage" // memesan ke supplier dan membatalkan PO
  | "purchasing:receive" // mencatat penerimaan barang
  | "purchasing:payment" // membayar tagihan supplier
  | "purchasing:all" // melihat PO semua orang dan daftar supplier
  | "finance:view"
  | "hr:view"
  | "hr:manage" // tambah/ubah karyawan, ajukan dan putuskan cuti
  | "hr:payroll" // melihat gaji dan tab Payroll
  | "reports:view"
  | "team:manage"
  | "settings:view"
  | "settings:company" // ubah data perusahaan (nama, pajak, prefix invoice)
  // widget dashboard
  | "kpi:business"
  | "kpi:staff"
  | "chart:sales"
  | "finance:receivables"
  | "finance:cashflow"
  | "products:top"
  | "stock:low"
  | "orders:pending"
  | "invoices:unpaid"
  | "activity:view"
  | "billing:plan"
  | "onboarding:view";

export type SessionUser = { name: string; email: string; role: string; company: string };

export type MenuItem = { label: string; href: string; icon: IconName; perm: Permission; ready: boolean };

/** Konfigurasi yang dipakai bersama oleh semua halaman (sidebar, topbar, izin) */
export type ShellConfig = {
  settings: {
    /** tampilkan pilihan "Viewing as" untuk mencoba semua peran (matikan sebelum rilis) */
    allowRoleSwitch: boolean;
    /** true = tanpa sesi login akan diarahkan ke signInHref */
    requireLogin: boolean;
    /** halaman Sign In (tujuan saat belum login / setelah Sign out) */
    signInHref: string;
    /** dipakai bila requireLogin = false dan belum ada sesi */
    fallbackUser: SessionUser;
  };
  roleInfo: Record<Role, { label: string; description: string }>;
  permissions: Record<Role, Permission[]>;
  menu: MenuItem[];
  adminMenu: MenuItem[];
  notifications: { text: string; time: string }[];
};

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  good: boolean;
  icon: IconName;
  perm: Permission;
};

export type ChartSet = { labels: string[]; sales: number[]; purchases: number[] };

/** Data khusus halaman Dashboard */
export type DashboardData = {
  quickActions: { label: string; icon: IconName; perm: Permission; href?: string }[];
  kpis: Kpi[];
  chart: { "7d": ChartSet; "30d": ChartSet };
  cashflow: { inflow: number; outflow: number };
  receivables: { label: string; value: string; pct: number }[];
  orders: { id: string; customer: string; total: string; status: string }[];
  invoices: { id: string; customer: string; due: string; amount: string; overdue: boolean }[];
  topProducts: { name: string; sold: number; pct: number }[];
  lowStock: { name: string; sku: string; stock: number; min: number }[];
  team: { byRole: { role: string; count: number }[]; invites: { email: string; role: string }[] };
  plan: { name: string; price: string; renews: string; note: string };
  onboarding: { label: string; done: boolean }[];
  activity: { who: string; text: string; time: string; areas: string[] }[];
  activityAreas: Record<Role, string[]>;
  tasks: { id: number; label: string; done: boolean }[];
};
