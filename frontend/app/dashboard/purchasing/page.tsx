import type { Metadata } from "next";
import PurchasingView from "@/components/purchasing/PurchasingView";
import type { PurchasingData } from "@/components/purchasing/types";

export const metadata: Metadata = {
  title: "Purchasing – ETERA",
  description: "Purchase orders, goods receipts, suppliers, and supplier bills.",
};

/* =====================================================================
   DATA HALAMAN PURCHASING (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/dashboard/layout.tsx.
   Izin yang dipakai halaman ini:
   - purchasing:view     → boleh membuka halaman
   - purchasing:create   → membuat PO baru (tanpa purchasing:manage disimpan sebagai draft)
   - purchasing:manage   → memesan ke supplier (Place order) dan membatalkan PO
   - purchasing:receive  → mencatat penerimaan barang
   - purchasing:payment  → membayar tagihan supplier dan melihat tab Payments
   - purchasing:all      → melihat PO semua orang dan tab Suppliers
                           (tanpa ini hanya PO buatan sendiri, dicocokkan dengan nama user)
   Catatan: hanya untuk prototipe. Perubahan tidak tersimpan (hilang saat
   halaman dimuat ulang) dan stok di halaman Inventory tidak ikut berubah.
   Untuk produksi, simpan lewat API, catat stock_movements saat barang
   diterima, dan cek izin di server.
   ===================================================================== */

const data: PurchasingData = {
  today: "2026-11-27", // dianggap "hari ini" (dipakai untuk status terlambat dan jatuh tempo)
  taxRate: 0.11, // PPN 11%
  pageSize: 8,

  methods: [
    { value: "transfer", label: "Transfer" },
    { value: "cash", label: "Cash" },
    { value: "qris", label: "QRIS" },
    { value: "card", label: "Card" },
  ],

  // sama dengan gudang di halaman Inventory
  warehouses: [
    { id: "main", name: "Main Warehouse", city: "Bandung" },
    { id: "store", name: "Store Front", city: "Bandung" },
    { id: "east", name: "East Depot", city: "Cimahi" },
  ],

  // termDays = tempo pembayaran (hari), 0 = bayar saat barang tiba. leadDays = lama pengiriman.
  suppliers: [
    { id: "s1", name: "CV Kopi Priangan", phone: "022-555-0201", city: "Bandung", termDays: 14, leadDays: 3 },
    { id: "s2", name: "PT Sumber Teh Nusantara", phone: "0260-555-0202", city: "Subang", termDays: 30, leadDays: 5 },
    { id: "s3", name: "UD Gula Lestari", phone: "0812-3000-1203", city: "Garut", termDays: 7, leadDays: 2 },
    { id: "s4", name: "Madu Hutan Sejahtera", phone: "0266-555-0204", city: "Sukabumi", termDays: 14, leadDays: 7 },
    { id: "s5", name: "Pabrik Cokelat Dago", phone: "022-555-0205", city: "Bandung", termDays: 30, leadDays: 4 },
    { id: "s6", name: "Snack Jaya Mandiri", phone: "0857-3000-1206", city: "Cimahi", termDays: 14, leadDays: 3 },
  ],

  // stok = total semua gudang, min = batas stok minimum (sama dengan halaman Inventory)
  products: [
    { id: "p1", sku: "KA-250", name: "Kopi Arabika 250g", unit: "pack", cost: 48000, stock: 175, min: 40 },
    { id: "p2", sku: "KR-250", name: "Kopi Robusta 250g", unit: "pack", cost: 36000, stock: 12, min: 30 },
    { id: "p3", sku: "KC-500", name: "Kopi Cold Brew 500ml", unit: "bottle", cost: 27000, stock: 0, min: 20 },
    { id: "p4", sku: "TM-100", name: "Teh Melati 100g", unit: "pack", cost: 14000, stock: 14, min: 25 },
    { id: "p5", sku: "TH-100", name: "Teh Hijau 100g", unit: "pack", cost: 16000, stock: 97, min: 25 },
    { id: "p6", sku: "TB-020", name: "Teh Celup Box 20s", unit: "box", cost: 12000, stock: 154, min: 30 },
    { id: "p7", sku: "GA-001", name: "Gula Aren 1kg", unit: "kg", cost: 32000, stock: 6, min: 20 },
    { id: "p8", sku: "GP-001", name: "Gula Pasir 1kg", unit: "kg", cost: 14000, stock: 250, min: 40 },
    { id: "p9", sku: "SG-250", name: "Sirup Gula Cair 250ml", unit: "bottle", cost: 15000, stock: 48, min: 20 },
    { id: "p10", sku: "MH-014", name: "Madu Hutan 500ml", unit: "bottle", cost: 62000, stock: 9, min: 15 },
    { id: "p11", sku: "MK-250", name: "Madu Kelengkeng 250ml", unit: "bottle", cost: 38000, stock: 40, min: 15 },
    { id: "p12", sku: "LM-100", name: "Lemon Madu Sachet", unit: "box", cost: 21000, stock: 33, min: 20 },
    { id: "p13", sku: "CB-080", name: "Cokelat Batang 80g", unit: "pcs", cost: 11000, stock: 125, min: 30 },
    { id: "p14", sku: "KP-150", name: "Keripik Singkong 150g", unit: "pack", cost: 9000, stock: 0, min: 30 },
    { id: "p15", sku: "KS-200", name: "Kacang Sangrai 200g", unit: "pack", cost: 12000, stock: 72, min: 30 },
  ],

  // dueDate = tanggal PO + termDays supplier; expectedDate = tanggal PO + leadDays supplier
  orders: [
    { id: "po2041", number: "PO-2041", supplierId: "s3", date: "2026-11-27", expectedDate: "2026-11-29", dueDate: "2026-12-04", status: "draft", discount: 0, note: "Gula Aren is below minimum stock", createdBy: "Dewi Anggraini", items: [{ productId: "p7", qty: 60, cost: 32000 }] },
    { id: "po2040", number: "PO-2040", supplierId: "s1", date: "2026-11-26", expectedDate: "2026-11-29", dueDate: "2026-12-10", status: "ordered", discount: 0, note: "Restock robusta and cold brew", createdBy: "Dewi Anggraini", items: [{ productId: "p2", qty: 80, cost: 36000 }, { productId: "p3", qty: 40, cost: 27000 }] },
    { id: "po2039", number: "PO-2039", supplierId: "s4", date: "2026-11-24", expectedDate: "2026-12-01", dueDate: "2026-12-08", status: "ordered", discount: 0, note: "Deliver in two batches", createdBy: "Budi Santoso", items: [{ productId: "p10", qty: 30, cost: 62000 }, { productId: "p11", qty: 20, cost: 38000 }] },
    { id: "po2038", number: "PO-2038", supplierId: "s2", date: "2026-11-20", expectedDate: "2026-11-25", dueDate: "2026-12-20", status: "ordered", discount: 0, note: "", createdBy: "Dewi Anggraini", items: [{ productId: "p4", qty: 100, cost: 14000 }, { productId: "p5", qty: 60, cost: 16000 }, { productId: "p6", qty: 80, cost: 12000 }] },
    { id: "po2037", number: "PO-2037", supplierId: "s5", date: "2026-11-18", expectedDate: "2026-11-22", dueDate: "2026-12-18", status: "received", discount: 0, note: "", createdBy: "Dewi Anggraini", items: [{ productId: "p13", qty: 150, cost: 11000 }] },
    { id: "po2036", number: "PO-2036", supplierId: "s6", date: "2026-11-12", expectedDate: "2026-11-15", dueDate: "2026-11-26", status: "received", discount: 0, note: "", createdBy: "Dewi Anggraini", items: [{ productId: "p15", qty: 60, cost: 12000 }, { productId: "p14", qty: 80, cost: 9000 }] },
    { id: "po2035", number: "PO-2035", supplierId: "s3", date: "2026-11-10", expectedDate: "2026-11-12", dueDate: "2026-11-17", status: "received", discount: 100000, note: "Bulk discount agreed", createdBy: "Dewi Anggraini", items: [{ productId: "p8", qty: 200, cost: 14000 }, { productId: "p7", qty: 40, cost: 32000 }] },
    { id: "po2034", number: "PO-2034", supplierId: "s1", date: "2026-11-05", expectedDate: "2026-11-08", dueDate: "2026-11-19", status: "received", discount: 0, note: "", createdBy: "Budi Santoso", items: [{ productId: "p1", qty: 100, cost: 48000 }, { productId: "p2", qty: 40, cost: 36000 }] },
    { id: "po2033", number: "PO-2033", supplierId: "s2", date: "2026-11-03", expectedDate: "2026-11-08", dueDate: "2026-12-03", status: "cancelled", discount: 0, note: "Supplier out of stock", createdBy: "Dewi Anggraini", items: [{ productId: "p5", qty: 100, cost: 16000 }] },
    { id: "po2032", number: "PO-2032", supplierId: "s5", date: "2026-10-29", expectedDate: "2026-11-02", dueDate: "2026-11-28", status: "received", discount: 0, note: "", createdBy: "Dewi Anggraini", items: [{ productId: "p13", qty: 200, cost: 11000 }] },
    { id: "po2031", number: "PO-2031", supplierId: "s1", date: "2026-10-27", expectedDate: "2026-10-30", dueDate: "2026-11-10", status: "received", discount: 0, note: "", createdBy: "Budi Santoso", items: [{ productId: "p1", qty: 60, cost: 48000 }] },
    { id: "po2030", number: "PO-2030", supplierId: "s4", date: "2026-10-22", expectedDate: "2026-10-29", dueDate: "2026-11-05", status: "received", discount: 0, note: "", createdBy: "Dewi Anggraini", items: [{ productId: "p10", qty: 20, cost: 62000 }, { productId: "p11", qty: 10, cost: 38000 }] },
  ],

  // jumlah diterima per item dihitung dari data ini
  receipts: [
    { id: "r1", poId: "po2039", date: "2026-11-26", warehouseId: "main", by: "Dewi Anggraini", lines: [{ productId: "p10", qty: 15 }] },
    { id: "r2", poId: "po2038", date: "2026-11-25", warehouseId: "main", by: "Dewi Anggraini", lines: [{ productId: "p6", qty: 80 }, { productId: "p4", qty: 40 }] },
    { id: "r3", poId: "po2037", date: "2026-11-22", warehouseId: "main", by: "Dewi Anggraini", lines: [{ productId: "p13", qty: 150 }] },
    { id: "r4", poId: "po2036", date: "2026-11-16", warehouseId: "east", by: "Dewi Anggraini", lines: [{ productId: "p15", qty: 60 }, { productId: "p14", qty: 80 }] },
    { id: "r5", poId: "po2035", date: "2026-11-12", warehouseId: "main", by: "Dewi Anggraini", lines: [{ productId: "p8", qty: 200 }, { productId: "p7", qty: 40 }] },
    { id: "r6", poId: "po2034", date: "2026-11-08", warehouseId: "main", by: "Budi Santoso", lines: [{ productId: "p1", qty: 100 }, { productId: "p2", qty: 40 }] },
    { id: "r7", poId: "po2032", date: "2026-11-02", warehouseId: "main", by: "Dewi Anggraini", lines: [{ productId: "p13", qty: 200 }] },
    { id: "r8", poId: "po2031", date: "2026-10-30", warehouseId: "main", by: "Budi Santoso", lines: [{ productId: "p1", qty: 60 }] },
    { id: "r9", poId: "po2030", date: "2026-10-29", warehouseId: "main", by: "Dewi Anggraini", lines: [{ productId: "p10", qty: 20 }, { productId: "p11", qty: 10 }] },
  ],

  payments: [
    { id: "pay8", poId: "po2039", date: "2026-11-24", amount: 1500000, method: "transfer", ref: "Down payment", by: "Dedi Kurniawan" },
    { id: "pay7", poId: "po2038", date: "2026-11-21", amount: 1000000, method: "transfer", ref: "TRF-9104", by: "Dedi Kurniawan" },
    { id: "pay6", poId: "po2037", date: "2026-11-23", amount: 1000000, method: "transfer", ref: "TRF-9120", by: "Dedi Kurniawan" },
    { id: "pay5", poId: "po2036", date: "2026-11-20", amount: 600000, method: "cash", ref: "", by: "Dedi Kurniawan" },
    { id: "pay4", poId: "po2035", date: "2026-11-14", amount: 4417800, method: "transfer", ref: "TRF-9031", by: "Dedi Kurniawan" },
    { id: "pay3", poId: "po2034", date: "2026-11-18", amount: 6926400, method: "transfer", ref: "TRF-9078", by: "Dedi Kurniawan" },
    { id: "pay2", poId: "po2032", date: "2026-11-05", amount: 2442000, method: "transfer", ref: "TRF-8967", by: "Dedi Kurniawan" },
    { id: "pay1", poId: "po2031", date: "2026-11-10", amount: 3196800, method: "transfer", ref: "TRF-8990", by: "Dedi Kurniawan" },
    { id: "pay0", poId: "po2030", date: "2026-11-03", amount: 1798200, method: "qris", ref: "QR-6120", by: "Dedi Kurniawan" },
  ],
};

export default function PurchasingPage() {
  return <PurchasingView data={data} />;
}
