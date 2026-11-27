import type { Metadata } from "next";
import FinanceView from "@/components/finance/FinanceView";
import type { FinanceData } from "@/components/finance/types";

export const metadata: Metadata = {
  title: "Finance – ETERA",
  description: "Invoices, supplier bills, cash, and bank accounts.",
};

/* =====================================================================
   DATA HALAMAN FINANCE (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/dashboard/layout.tsx.
   Izin yang dipakai halaman ini (sudah ada, tidak perlu izin baru):
   - finance:view         → boleh membuka halaman
   - finance:receivables  → tab Invoices dan Bills, mencatat pembayaran
   - finance:cashflow     → tab Cash & bank dan transaksi manual
   Cara kerja: jumlah terbayar tiap invoice/bill dan saldo tiap akun dihitung
   dari daftar `txns`. Mencatat pembayaran otomatis membuat transaksi kas.
   Catatan: hanya untuk prototipe. Perubahan tidak tersimpan (hilang saat
   halaman dimuat ulang). Untuk produksi, simpan lewat API dan cek izin di server.
   ===================================================================== */

const data: FinanceData = {
  today: "2026-11-27", // dianggap "hari ini" (dipakai untuk status jatuh tempo)
  pageSize: 8,

  // opening = saldo awal sebelum transaksi pertama di daftar `txns` (per 1 Okt 2026)
  accounts: [
    { id: "a1", name: "Cash on hand", type: "cash", opening: 5000000 },
    { id: "a2", name: "BCA ••• 4417", type: "bank", opening: 85000000 },
    { id: "a3", name: "Mandiri ••• 0921", type: "bank", opening: 40000000 },
    { id: "a4", name: "QRIS wallet", type: "ewallet", opening: 2000000 },
  ],

  categories: {
    in: ["Walk-in sales", "QRIS settlement", "Owner deposit", "Other income"],
    out: ["Rent", "Salaries", "Utilities", "Transport", "Packaging", "Other expense"],
  },

  // total sudah termasuk PPN. Bill mengikuti PO di halaman Purchasing.
  docs: [
    { id: "i1", kind: "invoice", number: "INV-2209", party: "CV Maju Bersama", date: "2026-11-23", dueDate: "2026-11-30", total: 7200000 },
    { id: "i2", kind: "invoice", number: "INV-2203", party: "Toko Sinar Jaya", date: "2026-11-19", dueDate: "2026-12-03", total: 4800000 },
    { id: "i3", kind: "invoice", number: "INV-2201", party: "Resto Nusantara", date: "2026-11-17", dueDate: "2026-12-17", total: 6100000 },
    { id: "i4", kind: "invoice", number: "INV-2198", party: "Minimarket Berkah", date: "2026-11-14", dueDate: "2026-11-28", total: 3300000 },
    { id: "i5", kind: "invoice", number: "INV-2188", party: "Warung Bu Ani", date: "2026-11-08", dueDate: "2026-11-22", total: 1900000 },
    { id: "i6", kind: "invoice", number: "INV-2175", party: "Kafe Senja", date: "2026-11-01", dueDate: "2026-11-15", total: 3400000 },
    { id: "i7", kind: "invoice", number: "INV-2162", party: "Bakery Roti Hangat", date: "2026-10-20", dueDate: "2026-11-03", total: 2750000 },
    { id: "i8", kind: "invoice", number: "INV-2140", party: "CV Maju Bersama", date: "2026-09-25", dueDate: "2026-10-10", total: 8400000 },
    { id: "i9", kind: "invoice", number: "INV-2120", party: "Kafe Senja", date: "2026-09-15", dueDate: "2026-09-29", total: 2100000 },

    { id: "b1", kind: "bill", number: "BILL-2040", ref: "PO-2040", party: "CV Kopi Priangan", date: "2026-11-26", dueDate: "2026-12-10", total: 4395600 },
    { id: "b2", kind: "bill", number: "BILL-2039", ref: "PO-2039", party: "Madu Hutan Sejahtera", date: "2026-11-24", dueDate: "2026-12-08", total: 2908200 },
    { id: "b3", kind: "bill", number: "BILL-2038", ref: "PO-2038", party: "PT Sumber Teh Nusantara", date: "2026-11-20", dueDate: "2026-12-20", total: 3685200 },
    { id: "b4", kind: "bill", number: "BILL-2037", ref: "PO-2037", party: "Pabrik Cokelat Dago", date: "2026-11-18", dueDate: "2026-12-18", total: 1831500 },
    { id: "b5", kind: "bill", number: "BILL-2036", ref: "PO-2036", party: "Snack Jaya Mandiri", date: "2026-11-12", dueDate: "2026-11-26", total: 1598400 },
    { id: "b6", kind: "bill", number: "BILL-2035", ref: "PO-2035", party: "UD Gula Lestari", date: "2026-11-10", dueDate: "2026-11-17", total: 4417800 },
    { id: "b7", kind: "bill", number: "BILL-2034", ref: "PO-2034", party: "CV Kopi Priangan", date: "2026-11-05", dueDate: "2026-11-19", total: 6926400 },
  ],

  txns: [
    // pembayaran invoice (uang masuk)
    { id: "t01", date: "2026-11-24", accountId: "a2", type: "in", amount: 6100000, category: "Customer payment", note: "INV-2201 · TRF-9122", docId: "i3", by: "Dedi Kurniawan" },
    { id: "t02", date: "2026-11-20", accountId: "a3", type: "in", amount: 1000000, category: "Customer payment", note: "INV-2198 · Down payment", docId: "i4", by: "Dedi Kurniawan" },
    { id: "t03", date: "2026-11-04", accountId: "a2", type: "in", amount: 5000000, category: "Customer payment", note: "INV-2140 · TRF-9001", docId: "i8", by: "Dedi Kurniawan" },
    { id: "t04", date: "2026-10-05", accountId: "a3", type: "in", amount: 2100000, category: "Customer payment", note: "INV-2120", docId: "i9", by: "Dedi Kurniawan" },
    // pembayaran bill (uang keluar)
    { id: "t05", date: "2026-11-24", accountId: "a2", type: "out", amount: 1500000, category: "Supplier payment", note: "BILL-2039 · Down payment", docId: "b2", by: "Dedi Kurniawan" },
    { id: "t06", date: "2026-11-21", accountId: "a2", type: "out", amount: 1000000, category: "Supplier payment", note: "BILL-2038 · TRF-9104", docId: "b3", by: "Dedi Kurniawan" },
    { id: "t07", date: "2026-11-23", accountId: "a3", type: "out", amount: 1000000, category: "Supplier payment", note: "BILL-2037 · TRF-9120", docId: "b4", by: "Dedi Kurniawan" },
    { id: "t08", date: "2026-11-20", accountId: "a1", type: "out", amount: 600000, category: "Supplier payment", note: "BILL-2036", docId: "b5", by: "Dedi Kurniawan" },
    { id: "t09", date: "2026-11-14", accountId: "a2", type: "out", amount: 4417800, category: "Supplier payment", note: "BILL-2035 · TRF-9031", docId: "b6", by: "Dedi Kurniawan" },
    { id: "t10", date: "2026-11-18", accountId: "a2", type: "out", amount: 6926400, category: "Supplier payment", note: "BILL-2034 · TRF-9078", docId: "b7", by: "Dedi Kurniawan" },
    // transaksi lain
    { id: "t11", date: "2026-11-02", accountId: "a1", type: "in", amount: 4250000, category: "Walk-in sales", note: "Store front sales, week 1", by: "Dedi Kurniawan" },
    { id: "t12", date: "2026-11-03", accountId: "a2", type: "out", amount: 12000000, category: "Rent", note: "November store rent", by: "Rina Pratama" },
    { id: "t13", date: "2026-11-05", accountId: "a4", type: "in", amount: 1860000, category: "QRIS settlement", note: "QRIS settlement", by: "Dedi Kurniawan" },
    { id: "t14", date: "2026-11-07", accountId: "a3", type: "out", amount: 1450000, category: "Utilities", note: "Electricity and internet", by: "Dedi Kurniawan" },
    { id: "t15", date: "2026-11-10", accountId: "a1", type: "in", amount: 3980000, category: "Walk-in sales", note: "Store front sales, week 2", by: "Dedi Kurniawan" },
    { id: "t16", date: "2026-11-14", accountId: "a1", type: "out", amount: 650000, category: "Transport", note: "Delivery fuel", by: "Dedi Kurniawan" },
    { id: "t17", date: "2026-11-18", accountId: "a4", type: "in", amount: 2240000, category: "QRIS settlement", note: "QRIS settlement", by: "Dedi Kurniawan" },
    { id: "t18", date: "2026-11-25", accountId: "a2", type: "out", amount: 18500000, category: "Salaries", note: "Staff salaries, November", by: "Rina Pratama" },
    { id: "t19", date: "2026-11-26", accountId: "a1", type: "in", amount: 2975000, category: "Walk-in sales", note: "Store front sales, week 4", by: "Dedi Kurniawan" },
    { id: "t20", date: "2026-11-27", accountId: "a1", type: "out", amount: 320000, category: "Packaging", note: "Packaging supplies", by: "Dedi Kurniawan" },
  ],
};

export default function FinancePage() {
  return <FinanceView data={data} />;
}
