import type { Metadata } from "next";
import SettingsView from "@/components/settings/SettingsView";
import type { SettingsData } from "@/components/settings/types";

export const metadata: Metadata = {
  title: "Settings – ETERA",
  description: "Your profile, company details, and notification preferences.",
};

/* =====================================================================
   DATA HALAMAN SETTINGS (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/dashboard/layout.tsx.
   Izin yang dipakai halaman ini:
   - settings:view     → boleh membuka halaman (tab Profile dan Notifications)
   - settings:company  → boleh melihat dan mengubah tab Company (Owner, Admin)
   Pemberitahuan hanya tampil bila peran punya izin `perm` di tiap item.
   Catatan: hanya untuk prototipe. Perubahan tidak tersimpan (hilang saat
   halaman dimuat ulang). Untuk produksi, simpan lewat API dan cek izin di
   server, termasuk saat mengganti password.
   ===================================================================== */

const data: SettingsData = {
  company: {
    name: "Toko Rina",
    address: "Jl. Braga No. 21, Bandung, Jawa Barat 40111",
    phone: "022-1234-5678",
    email: "hello@tokorina.id",
    taxId: "",
    timezone: "Asia/Jakarta",
    taxRate: 11,
    invoicePrefix: "INV",
    currency: "IDR",
  },
  timezones: [
    { value: "Asia/Jakarta", label: "WIB – Jakarta (UTC+7)" },
    { value: "Asia/Makassar", label: "WITA – Makassar (UTC+8)" },
    { value: "Asia/Jayapura", label: "WIT – Jayapura (UTC+9)" },
  ],
  passwordMinLength: 8,
  notifications: [
    { id: "low-stock", label: "Low stock", description: "A product falls below its minimum stock.", perm: "stock:low", defaults: { inApp: true, email: true } },
    { id: "new-order", label: "New orders", description: "A customer order is created or needs attention.", perm: "orders:pending", defaults: { inApp: true, email: false } },
    { id: "overdue-invoice", label: "Overdue invoices", description: "A customer invoice passes its due date.", perm: "invoices:unpaid", defaults: { inApp: true, email: true } },
    { id: "supplier-payment", label: "Supplier bills due", description: "A purchase bill is about to fall due.", perm: "purchasing:payment", defaults: { inApp: true, email: true } },
    { id: "leave-request", label: "Leave requests", description: "An employee submits a leave request to decide.", perm: "hr:manage", defaults: { inApp: true, email: true } },
    { id: "weekly-summary", label: "Weekly summary", description: "A recap of sales, purchases, and cash every Monday.", perm: "kpi:business", defaults: { inApp: false, email: true } },
  ],
};

export default function SettingsPage() {
  return <SettingsView data={data} />;
}
