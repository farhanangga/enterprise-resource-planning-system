import AppShell from "@/components/dashboard/AppShell";
import type { ShellConfig } from "@/components/dashboard/types";

/* =====================================================================
   KONFIGURASI BERSAMA (sidebar, topbar, izin per peran) — atur di sini.
   Layout ini membungkus semua halaman di folder app/(app)/ (dashboard,
   inventory, dst.), jadi sidebar tidak dimuat ulang saat pindah halaman.
   - Peran diambil dari akun yang login (lihat app/auth/signIn/page.tsx).
   - Menu dan widget tampil hanya bila peran punya izin (`perm`) terkait.
   Catatan: hanya untuk prototipe. Untuk produksi, cek izin juga di server.
   ===================================================================== */

const config: ShellConfig = {
  settings: {
    allowRoleSwitch: true, // matikan sebelum rilis
    requireLogin: true,
    signInHref: "/auth/signIn", // sesuaikan dengan lokasi halaman Sign In Anda
    fallbackUser: { name: "Guest Owner", email: "owner@etera.app", role: "Owner", company: "Toko Rina" },
  },

  roleInfo: {
    owner: { label: "Owner", description: "Full view of your business: sales, cash, stock, team, and subscription." },
    admin: { label: "Admin", description: "Run daily operations, manage people, and keep every module in order." },
    manager: { label: "Manager", description: "Track sales, purchasing, and stock, and keep orders moving." },
    finance: { label: "Finance", description: "Keep receivables, invoices, and cash flow under control." },
    staff: { label: "Staff", description: "Your tasks, orders, and stock alerts for today." },
  },

  permissions: {
    owner: [
      "dashboard:view", "inventory:view", "inventory:manage", "inventory:adjust", "inventory:cost",
      "sales:view", "purchasing:view", "finance:view", "hr:view", "reports:view", "team:manage", "settings:view",
      "kpi:business", "chart:sales", "finance:receivables", "finance:cashflow", "products:top", "stock:low",
      "orders:pending", "invoices:unpaid", "activity:view", "billing:plan", "onboarding:view",
    ],
    admin: [
      "dashboard:view", "inventory:view", "inventory:manage", "inventory:adjust", "inventory:cost",
      "sales:view", "purchasing:view", "finance:view", "hr:view", "reports:view", "team:manage", "settings:view",
      "kpi:business", "chart:sales", "finance:receivables", "products:top", "stock:low",
      "orders:pending", "invoices:unpaid", "activity:view", "onboarding:view",
    ],
    manager: [
      "dashboard:view", "inventory:view", "inventory:manage", "inventory:adjust", "inventory:cost",
      "sales:view", "purchasing:view", "reports:view", "settings:view",
      "kpi:business", "chart:sales", "products:top", "stock:low", "orders:pending", "activity:view",
    ],
    finance: [
      "dashboard:view", "finance:view", "reports:view", "settings:view",
      "kpi:business", "chart:sales", "finance:receivables", "finance:cashflow", "invoices:unpaid", "activity:view",
    ],
    staff: [
      "dashboard:view", "inventory:view", "inventory:adjust", "sales:view", "settings:view",
      "kpi:staff", "products:top", "stock:low", "orders:pending", "activity:view",
    ],
  },

  // ready: false = tampil "Soon" dan belum bisa diklik. Ubah ke true setelah halamannya dibuat.
  menu: [
    { label: "Dashboard", href: "/dashboard/main", icon: "dashboard", perm: "dashboard:view", ready: true },
    { label: "Inventory", href: "/dashboard/inventory", icon: "inventory", perm: "inventory:view", ready: true },
    { label: "Sales", href: "/dashboard/sales", icon: "sales", perm: "sales:view", ready: false },
    { label: "Purchasing", href: "/dashboard/purchasing", icon: "cart", perm: "purchasing:view", ready: false },
    { label: "Finance", href: "/dashboard/finance", icon: "finance", perm: "finance:view", ready: false },
    { label: "HR", href: "/dashboard/hr", icon: "hr", perm: "hr:view", ready: false },
    { label: "Reports", href: "/dashboard/reports", icon: "reports", perm: "reports:view", ready: false },
  ],
  adminMenu: [
    { label: "Team & Roles", href: "/dashboard/team", icon: "shield", perm: "team:manage", ready: false },
    { label: "Settings", href: "/dashboard/settings", icon: "settings", perm: "settings:view", ready: false },
  ],

  notifications: [
    { text: "Invoice INV-2188 is 5 days overdue", time: "10 min ago" },
    { text: "Gula Aren 1kg is below minimum stock", time: "1 hour ago" },
    { text: "New order SO-1044 from Toko Sinar Jaya", time: "2 hours ago" },
  ],
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell config={config}>{children}</AppShell>;
}
