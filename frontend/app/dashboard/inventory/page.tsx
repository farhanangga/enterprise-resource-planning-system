import type { Metadata } from "next";
import InventoryView from "@/components/inventory/InventoryView";
import type { InventoryData } from "@/components/inventory/types";

export const metadata: Metadata = {
  title: "Inventory – ETERA",
  description: "Products, stock levels, and stock movements.",
};

/* =====================================================================
   DATA HALAMAN INVENTORY (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/(app)/layout.tsx.
   Izin yang dipakai halaman ini:
   - inventory:view    → boleh membuka halaman
   - inventory:manage  → tambah / ubah produk
   - inventory:adjust  → catat barang masuk / keluar / hitung stok
   - inventory:cost    → melihat harga modal dan nilai stok
   Catatan: hanya untuk prototipe. Perubahan stok tidak tersimpan
   (hilang saat halaman dimuat ulang). Untuk produksi, simpan lewat API.
   ===================================================================== */

const data: InventoryData = {
  pageSize: 8,

  categories: ["Coffee", "Tea", "Sweeteners", "Honey", "Snacks"],
  units: ["pack", "pcs", "kg", "bottle", "box"],

  // gudang pertama dianggap gudang utama
  warehouses: [
    { id: "main", name: "Main Warehouse", city: "Bandung" },
    { id: "store", name: "Store Front", city: "Bandung" },
    { id: "east", name: "East Depot", city: "Cimahi" },
  ],

  products: [
    { id: "p1", sku: "KA-250", name: "Kopi Arabika 250g", category: "Coffee", unit: "pack", cost: 48000, price: 65000, min: 40, stock: { main: 120, store: 35, east: 20 }, active: true },
    { id: "p2", sku: "KR-250", name: "Kopi Robusta 250g", category: "Coffee", unit: "pack", cost: 36000, price: 52000, min: 30, stock: { main: 8, store: 4, east: 0 }, active: true },
    { id: "p3", sku: "KC-500", name: "Kopi Cold Brew 500ml", category: "Coffee", unit: "bottle", cost: 27000, price: 42000, min: 20, stock: { main: 0, store: 0, east: 0 }, active: true },
    { id: "p4", sku: "TM-100", name: "Teh Melati 100g", category: "Tea", unit: "pack", cost: 14000, price: 22000, min: 25, stock: { main: 10, store: 4, east: 0 }, active: true },
    { id: "p5", sku: "TH-100", name: "Teh Hijau 100g", category: "Tea", unit: "pack", cost: 16000, price: 25000, min: 25, stock: { main: 60, store: 22, east: 15 }, active: true },
    { id: "p6", sku: "TB-020", name: "Teh Celup Box 20s", category: "Tea", unit: "box", cost: 12000, price: 19000, min: 30, stock: { main: 90, store: 34, east: 30 }, active: true },
    { id: "p7", sku: "GA-001", name: "Gula Aren 1kg", category: "Sweeteners", unit: "kg", cost: 32000, price: 45000, min: 20, stock: { main: 4, store: 2, east: 0 }, active: true },
    { id: "p8", sku: "GP-001", name: "Gula Pasir 1kg", category: "Sweeteners", unit: "kg", cost: 14000, price: 18000, min: 40, stock: { main: 150, store: 40, east: 60 }, active: true },
    { id: "p9", sku: "SG-250", name: "Sirup Gula Cair 250ml", category: "Sweeteners", unit: "bottle", cost: 15000, price: 24000, min: 20, stock: { main: 33, store: 10, east: 5 }, active: true },
    { id: "p10", sku: "MH-014", name: "Madu Hutan 500ml", category: "Honey", unit: "bottle", cost: 62000, price: 89000, min: 15, stock: { main: 6, store: 3, east: 0 }, active: true },
    { id: "p11", sku: "MK-250", name: "Madu Kelengkeng 250ml", category: "Honey", unit: "bottle", cost: 38000, price: 55000, min: 15, stock: { main: 28, store: 12, east: 0 }, active: true },
    { id: "p12", sku: "LM-100", name: "Lemon Madu Sachet", category: "Honey", unit: "box", cost: 21000, price: 34000, min: 20, stock: { main: 25, store: 8, east: 0 }, active: true },
    { id: "p13", sku: "CB-080", name: "Cokelat Batang 80g", category: "Snacks", unit: "pcs", cost: 11000, price: 18000, min: 30, stock: { main: 70, store: 30, east: 25 }, active: true },
    { id: "p14", sku: "KP-150", name: "Keripik Singkong 150g", category: "Snacks", unit: "pack", cost: 9000, price: 15000, min: 30, stock: { main: 0, store: 0, east: 0 }, active: true },
    { id: "p15", sku: "KS-200", name: "Kacang Sangrai 200g", category: "Snacks", unit: "pack", cost: 12000, price: 19000, min: 30, stock: { main: 44, store: 18, east: 10 }, active: true },
  ],

  movements: [
    { id: "m1", date: "25 Nov 2026, 10:42", productId: "p1", product: "Kopi Arabika 250g", type: "in", qty: 60, warehouseId: "main", ref: "PO-2031 from supplier", by: "Sari Wulandari" },
    { id: "m2", date: "25 Nov 2026, 09:15", productId: "p10", product: "Madu Hutan 500ml", type: "out", qty: -4, warehouseId: "store", ref: "SO-1042", by: "Sari Wulandari" },
    { id: "m3", date: "24 Nov 2026, 16:30", productId: "p7", product: "Gula Aren 1kg", type: "adjust", qty: -3, warehouseId: "main", ref: "Stock count", by: "Dewi Anggraini" },
    { id: "m4", date: "24 Nov 2026, 14:05", productId: "p5", product: "Teh Hijau 100g", type: "in", qty: 40, warehouseId: "east", ref: "Transfer from main", by: "Dewi Anggraini" },
    { id: "m5", date: "24 Nov 2026, 11:20", productId: "p14", product: "Keripik Singkong 150g", type: "out", qty: -30, warehouseId: "main", ref: "SO-1038", by: "Sari Wulandari" },
    { id: "m6", date: "23 Nov 2026, 15:48", productId: "p8", product: "Gula Pasir 1kg", type: "in", qty: 100, warehouseId: "main", ref: "PO-2029 from supplier", by: "Dewi Anggraini" },
    { id: "m7", date: "23 Nov 2026, 10:10", productId: "p3", product: "Kopi Cold Brew 500ml", type: "out", qty: -12, warehouseId: "store", ref: "SO-1035", by: "Sari Wulandari" },
    { id: "m8", date: "22 Nov 2026, 17:02", productId: "p13", product: "Cokelat Batang 80g", type: "adjust", qty: 5, warehouseId: "store", ref: "Stock count", by: "Dewi Anggraini" },
  ],
};

export default function InventoryPage() {
  return <InventoryView data={data} />;
}
