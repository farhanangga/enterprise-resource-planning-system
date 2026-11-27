import type { Metadata } from "next";
import Overview from "@/components/dashboard/Overview";
import type { DashboardData } from "@/components/dashboard/types";

export const metadata: Metadata = {
  title: "Dashboard – ETERA",
  description: "Your company at a glance.",
};

/* =====================================================================
   DATA HALAMAN DASHBOARD (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/(app)/layout.tsx.
   Setiap widget punya `perm`; tampil hanya bila peran punya izinnya.
   Catatan: hanya untuk prototipe. Untuk produksi, ambil data dari API.
   ===================================================================== */

const data: DashboardData = {
  /* ---------- AKSI CEPAT (maks. 3 per peran, urut dari atas) ---------- */
  quickActions: [
    { label: "New sale", icon: "sales", perm: "sales:view" },
    { label: "Create invoice", icon: "finance", perm: "finance:receivables" },
    { label: "Record payment", icon: "check", perm: "finance:receivables" },
    { label: "Create PO", icon: "cart", perm: "purchasing:view" },
    { label: "Add product", icon: "inventory", perm: "inventory:manage", href: "/inventory" },
    { label: "Check stock", icon: "inventory", perm: "stock:low", href: "/inventory" },
  ],

  /* ---------- KPI ---------- */
  kpis: [
    { label: "Total Sales", value: "Rp 184,2 jt", delta: "+12,4%", trend: "up", good: true, icon: "sales", perm: "kpi:business" },
    { label: "Total Purchases", value: "Rp 96,7 jt", delta: "+3,1%", trend: "up", good: true, icon: "cart", perm: "kpi:business" },
    { label: "Stock Value", value: "Rp 312,5 jt", delta: "-1,8%", trend: "down", good: false, icon: "inventory", perm: "kpi:business" },
    { label: "Overdue Receivables", value: "Rp 28,4 jt", delta: "7 invoices", trend: "flat", good: false, icon: "finance", perm: "finance:receivables" },
    { label: "Orders to process", value: "8", delta: "3 urgent", trend: "flat", good: false, icon: "sales", perm: "kpi:staff" },
    { label: "Low stock items", value: "5", delta: "2 new today", trend: "up", good: false, icon: "inventory", perm: "kpi:staff" },
    { label: "Tasks done today", value: "1 of 4", delta: "keep going", trend: "flat", good: true, icon: "check", perm: "kpi:staff" },
  ],

  /* ---------- GRAFIK (dalam jutaan rupiah) ---------- */
  chart: {
    "7d": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      sales: [18, 24, 21, 32, 28, 41, 20],
      purchases: [12, 16, 22, 14, 25, 18, 9],
    },
    "30d": {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      sales: [112, 128, 141, 184],
      purchases: [74, 81, 92, 97],
    },
  },

  cashflow: { inflow: 142.6, outflow: 98.4 }, // jutaan rupiah

  receivables: [
    { label: "Not due yet", value: "Rp 52,1 jt", pct: 100 },
    { label: "1–30 days", value: "Rp 18,4 jt", pct: 35 },
    { label: "31–60 days", value: "Rp 7,9 jt", pct: 15 },
    { label: "60+ days", value: "Rp 2,1 jt", pct: 4 },
  ],

  orders: [
    { id: "SO-1044", customer: "Toko Sinar Jaya", total: "Rp 4,8 jt", status: "Confirmed" },
    { id: "SO-1043", customer: "Warung Bu Ani", total: "Rp 1,2 jt", status: "Packing" },
    { id: "SO-1042", customer: "CV Maju Bersama", total: "Rp 7,5 jt", status: "Ready to ship" },
    { id: "SO-1041", customer: "Kafe Senja", total: "Rp 2,3 jt", status: "Packing" },
  ],

  invoices: [
    { id: "INV-2209", customer: "CV Maju Bersama", due: "Due in 3 days", amount: "Rp 7,2 jt", overdue: false },
    { id: "INV-2203", customer: "Toko Sinar Jaya", due: "Due in 6 days", amount: "Rp 4,8 jt", overdue: false },
    { id: "INV-2188", customer: "Warung Bu Ani", due: "5 days overdue", amount: "Rp 1,9 jt", overdue: true },
    { id: "INV-2175", customer: "Kafe Senja", due: "12 days overdue", amount: "Rp 3,4 jt", overdue: true },
  ],

  topProducts: [
    { name: "Kopi Arabika 250g", sold: 312, pct: 100 },
    { name: "Teh Melati 100g", sold: 248, pct: 79 },
    { name: "Gula Aren 1kg", sold: 196, pct: 63 },
    { name: "Madu Hutan 500ml", sold: 141, pct: 45 },
    { name: "Cokelat Batang 80g", sold: 98, pct: 31 },
  ],

  lowStock: [
    { name: "Gula Aren 1kg", sku: "GA-001", stock: 6, min: 20 },
    { name: "Madu Hutan 500ml", sku: "MH-014", stock: 9, min: 15 },
    { name: "Kopi Robusta 250g", sku: "KR-007", stock: 12, min: 30 },
    { name: "Teh Melati 100g", sku: "TM-003", stock: 14, min: 25 },
  ],

  team: {
    byRole: [
      { role: "Owner", count: 1 },
      { role: "Admin", count: 1 },
      { role: "Manager", count: 2 },
      { role: "Finance", count: 1 },
      { role: "Staff", count: 3 },
    ],
    invites: [{ email: "new.staff@tokorina.id", role: "Staff" }],
  },

  plan: {
    name: "Business",
    price: "Rp 299k / month",
    renews: "Renews on 12 Dec 2026",
    note: "Unlimited users, finance, HR, and purchasing.",
  },

  onboarding: [
    { label: "Complete your company profile", done: true },
    { label: "Add your first product", done: true },
    { label: "Invite your team", done: false },
    { label: "Record your first sale", done: false },
  ],

  /* ---------- AKTIVITAS ---------- */
  // areas = kategori aktivitas; peran hanya melihat kategori di `activityAreas`
  activity: [
    { who: "Sari", text: "recorded stock-in for Kopi Arabika 250g", time: "10 min ago", areas: ["inventory", "mine"] },
    { who: "Dewi", text: "confirmed order SO-1044", time: "35 min ago", areas: ["sales"] },
    { who: "Dedi", text: "recorded payment for INV-2201", time: "1 hour ago", areas: ["finance"] },
    { who: "Sari", text: "packed order SO-1043", time: "2 hours ago", areas: ["sales", "mine"] },
    { who: "Rina", text: "invited new.staff@tokorina.id", time: "Yesterday", areas: ["team"] },
    { who: "Dedi", text: "created invoice INV-2209", time: "Yesterday", areas: ["finance", "sales"] },
  ],
  activityAreas: {
    owner: ["sales", "finance", "inventory", "team"],
    admin: ["sales", "finance", "inventory", "team"],
    manager: ["sales", "inventory"],
    finance: ["finance"],
    staff: ["mine"],
  },

  tasks: [
    { id: 1, label: "Pack order SO-1043", done: true },
    { id: 2, label: "Pack order SO-1041", done: false },
    { id: 3, label: "Count stock: Gula Aren 1kg", done: false },
    { id: 4, label: "Record stock-in for Teh Melati", done: false },
  ],
};

export default function DashboardPage() {
  return <Overview data={data} />;
}
