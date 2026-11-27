import type { Metadata } from "next";
import SalesView from "@/components/sales/SalesView";
import type { SalesData } from "@/components/sales/types";

export const metadata: Metadata = {
  title: "Sales – ETERA",
  description: "Sales orders, customers, and payments.",
};

/* =====================================================================
   DATA HALAMAN SALES (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/(app)/layout.tsx.
   Izin yang dipakai halaman ini:
   - sales:view     → boleh membuka halaman
   - sales:create   → membuat order baru (tanpa sales:manage disimpan sebagai draft)
   - sales:manage   → konfirmasi / kirim / selesaikan / batalkan order
   - sales:payment  → mencatat pembayaran dan melihat tab Payments
   - sales:all      → melihat order semua orang dan tab Customers
                      (tanpa ini hanya order buatan sendiri, dicocokkan dengan nama user)
   Catatan: hanya untuk prototipe. Perubahan tidak tersimpan (hilang saat
   halaman dimuat ulang). Untuk produksi, simpan lewat API dan cek izin di server.
   ===================================================================== */

const data: SalesData = {
  today: "2026-11-27", // dianggap "hari ini" (dipakai untuk status jatuh tempo)
  taxRate: 0.11, // PPN 11%
  pageSize: 8,

  methods: [
    { value: "cash", label: "Cash" },
    { value: "transfer", label: "Transfer" },
    { value: "qris", label: "QRIS" },
    { value: "card", label: "Card" },
  ],

  // termDays = tempo pembayaran (hari). 0 = bayar langsung.
  customers: [
    { id: "c1", name: "Toko Sinar Jaya", phone: "0812-2000-1101", city: "Bandung", termDays: 14 },
    { id: "c2", name: "Warung Bu Ani", phone: "0813-2000-1102", city: "Cimahi", termDays: 7 },
    { id: "c3", name: "CV Maju Bersama", phone: "022-555-0103", city: "Bandung", termDays: 30 },
    { id: "c4", name: "Kafe Senja", phone: "0857-2000-1104", city: "Lembang", termDays: 14 },
    { id: "c5", name: "Resto Nusantara", phone: "022-555-0105", city: "Bandung", termDays: 30 },
    { id: "c6", name: "Minimarket Berkah", phone: "0821-2000-1106", city: "Cimahi", termDays: 14 },
    { id: "c7", name: "Bakery Roti Hangat", phone: "0878-2000-1107", city: "Bandung", termDays: 14 },
    { id: "c8", name: "Walk-in customer", phone: "", city: "Store Front", termDays: 0 },
  ],

  // stok contoh; harga jual mengikuti halaman Inventory
  products: [
    { id: "p1", sku: "KA-250", name: "Kopi Arabika 250g", unit: "pack", price: 65000, stock: 175 },
    { id: "p2", sku: "KR-250", name: "Kopi Robusta 250g", unit: "pack", price: 52000, stock: 12 },
    { id: "p4", sku: "TM-100", name: "Teh Melati 100g", unit: "pack", price: 22000, stock: 14 },
    { id: "p5", sku: "TH-100", name: "Teh Hijau 100g", unit: "pack", price: 25000, stock: 97 },
    { id: "p6", sku: "TB-020", name: "Teh Celup Box 20s", unit: "box", price: 19000, stock: 154 },
    { id: "p7", sku: "GA-001", name: "Gula Aren 1kg", unit: "kg", price: 45000, stock: 6 },
    { id: "p8", sku: "GP-001", name: "Gula Pasir 1kg", unit: "kg", price: 18000, stock: 250 },
    { id: "p10", sku: "MH-014", name: "Madu Hutan 500ml", unit: "bottle", price: 89000, stock: 9 },
    { id: "p11", sku: "MK-250", name: "Madu Kelengkeng 250ml", unit: "bottle", price: 55000, stock: 40 },
    { id: "p13", sku: "CB-080", name: "Cokelat Batang 80g", unit: "pcs", price: 18000, stock: 125 },
    { id: "p15", sku: "KS-200", name: "Kacang Sangrai 200g", unit: "pack", price: 19000, stock: 72 },
  ],

  // createdBy dicocokkan dengan nama user yang login (peran tanpa sales:all hanya melihat miliknya)
  orders: [
    { id: "o1044", number: "SO-1044", customerId: "c1", date: "2026-11-27", dueDate: "2026-12-11", status: "confirmed", discount: 0, note: "Deliver before noon", createdBy: "Dewi Anggraini", items: [{ productId: "p1", qty: 10, price: 65000 }, { productId: "p5", qty: 6, price: 25000 }] },
    { id: "o1043", number: "SO-1043", customerId: "c2", date: "2026-11-26", dueDate: "2026-12-03", status: "confirmed", discount: 0, note: "", createdBy: "Sari Wulandari", items: [{ productId: "p13", qty: 20, price: 18000 }, { productId: "p6", qty: 10, price: 19000 }] },
    { id: "o1042", number: "SO-1042", customerId: "c3", date: "2026-11-25", dueDate: "2026-12-25", status: "shipped", discount: 100000, note: "Bulk order, 30-day terms", createdBy: "Dewi Anggraini", items: [{ productId: "p1", qty: 20, price: 65000 }, { productId: "p11", qty: 8, price: 55000 }] },
    { id: "o1041", number: "SO-1041", customerId: "c4", date: "2026-11-25", dueDate: "2026-12-09", status: "confirmed", discount: 0, note: "", createdBy: "Sari Wulandari", items: [{ productId: "p15", qty: 12, price: 19000 }, { productId: "p8", qty: 10, price: 18000 }] },
    { id: "o1040", number: "SO-1040", customerId: "c5", date: "2026-11-24", dueDate: "2026-12-24", status: "draft", discount: 0, note: "Waiting for customer approval", createdBy: "Rina Pratama", items: [{ productId: "p10", qty: 6, price: 89000 }] },
    { id: "o1039", number: "SO-1039", customerId: "c6", date: "2026-11-22", dueDate: "2026-12-06", status: "completed", discount: 0, note: "", createdBy: "Sari Wulandari", items: [{ productId: "p6", qty: 30, price: 19000 }, { productId: "p5", qty: 12, price: 25000 }] },
    { id: "o1038", number: "SO-1038", customerId: "c8", date: "2026-11-22", dueDate: "2026-11-22", status: "completed", discount: 0, note: "", createdBy: "Sari Wulandari", items: [{ productId: "p13", qty: 5, price: 18000 }] },
    { id: "o1037", number: "SO-1037", customerId: "c1", date: "2026-11-18", dueDate: "2026-12-02", status: "completed", discount: 0, note: "", createdBy: "Dewi Anggraini", items: [{ productId: "p1", qty: 15, price: 65000 }, { productId: "p2", qty: 10, price: 52000 }] },
    { id: "o1036", number: "SO-1036", customerId: "c2", date: "2026-11-15", dueDate: "2026-11-22", status: "completed", discount: 0, note: "", createdBy: "Sari Wulandari", items: [{ productId: "p5", qty: 10, price: 25000 }] },
    { id: "o1035", number: "SO-1035", customerId: "c4", date: "2026-11-12", dueDate: "2026-11-26", status: "completed", discount: 0, note: "", createdBy: "Sari Wulandari", items: [{ productId: "p1", qty: 5, price: 65000 }, { productId: "p8", qty: 20, price: 18000 }] },
    { id: "o1034", number: "SO-1034", customerId: "c3", date: "2026-11-10", dueDate: "2026-12-10", status: "completed", discount: 0, note: "", createdBy: "Budi Santoso", items: [{ productId: "p11", qty: 10, price: 55000 }, { productId: "p10", qty: 4, price: 89000 }] },
    { id: "o1033", number: "SO-1033", customerId: "c7", date: "2026-11-08", dueDate: "2026-11-22", status: "cancelled", discount: 0, note: "Customer cancelled", createdBy: "Dewi Anggraini", items: [{ productId: "p6", qty: 40, price: 19000 }] },
    { id: "o1032", number: "SO-1032", customerId: "c5", date: "2026-11-05", dueDate: "2026-12-05", status: "completed", discount: 250000, note: "", createdBy: "Rina Pratama", items: [{ productId: "p1", qty: 30, price: 65000 }] },
    { id: "o1031", number: "SO-1031", customerId: "c6", date: "2026-10-29", dueDate: "2026-11-12", status: "completed", discount: 0, note: "", createdBy: "Dewi Anggraini", items: [{ productId: "p8", qty: 40, price: 18000 }] },
    { id: "o1030", number: "SO-1030", customerId: "c7", date: "2026-10-27", dueDate: "2026-11-10", status: "completed", discount: 0, note: "", createdBy: "Sari Wulandari", items: [{ productId: "p13", qty: 24, price: 18000 }] },
  ],

  payments: [
    { id: "pay10", orderId: "o1043", date: "2026-11-26", amount: 300000, method: "cash", ref: "Down payment", by: "Sari Wulandari" },
    { id: "pay9", orderId: "o1042", date: "2026-11-25", amount: 1000000, method: "transfer", ref: "TRF-9012", by: "Dedi Kurniawan" },
    { id: "pay8", orderId: "o1039", date: "2026-11-22", amount: 965700, method: "transfer", ref: "TRF-8841", by: "Dedi Kurniawan" },
    { id: "pay7", orderId: "o1038", date: "2026-11-22", amount: 99900, method: "cash", ref: "", by: "Sari Wulandari" },
    { id: "pay6", orderId: "o1037", date: "2026-11-19", amount: 1000000, method: "transfer", ref: "TRF-8790", by: "Dedi Kurniawan" },
    { id: "pay5", orderId: "o1035", date: "2026-11-13", amount: 300000, method: "cash", ref: "Down payment", by: "Sari Wulandari" },
    { id: "pay4", orderId: "o1034", date: "2026-11-10", amount: 1005660, method: "transfer", ref: "TRF-8702", by: "Dedi Kurniawan" },
    { id: "pay3", orderId: "o1032", date: "2026-11-05", amount: 1887000, method: "transfer", ref: "TRF-8655", by: "Dedi Kurniawan" },
    { id: "pay2", orderId: "o1031", date: "2026-10-30", amount: 799200, method: "qris", ref: "QR-5530", by: "Dedi Kurniawan" },
    { id: "pay1", orderId: "o1030", date: "2026-10-28", amount: 479520, method: "cash", ref: "", by: "Sari Wulandari" },
  ],
};

export default function SalesPage() {
  return <SalesView data={data} />;
}
