import type { Metadata } from "next";
import ReportsView from "@/components/reports/ReportsView";
import type { ReportData } from "@/components/reports/types";

export const metadata: Metadata = {
  title: "Reports – ETERA",
  description: "Sales, purchasing, and inventory reports.",
};

/* =====================================================================
   DATA HALAMAN REPORTS (statis) — atur semuanya di sini.
   Sidebar, peran, dan izin ada di app/dashboard/layout.tsx.
   Izin yang dipakai halaman ini (sudah ada, tidak perlu izin baru):
   - reports:view    → boleh membuka halaman Reports
   - sales:view      → tab Sales
   - purchasing:view → tab Purchasing
   - inventory:view  → tab Inventory
   - inventory:cost  → nilai stok dan perkiraan biaya (data harga beli)
   Cara kerja: semua angka laporan dihitung dari data dasar di bawah
   (unit terjual per produk per bulan, pembelian per supplier per bulan,
   dan stok produk). Bulan terakhir adalah bulan berjalan (month to date).
   Catatan: hanya untuk prototipe. Angka di sini belum tersambung ke
   halaman Sales, Purchasing, atau Inventory. Untuk produksi, hitung dari
   database lewat API dan cek izin di server.
   ===================================================================== */

const months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];

// harga jual = harga beli x 1,55, dibulatkan ke Rp 500 (belum termasuk PPN)
const price = (cost: number) => Math.round((cost * 1.55) / 500) * 500;

// [id, sku, nama, kategori, satuan, harga beli, stok, stok minimum, rata-rata unit terjual per bulan]
const catalog: [string, string, string, string, string, number, number, number, number][] = [
  ["p1", "KA-250", "Kopi Arabika 250g", "Coffee", "pack", 48000, 175, 40, 78],
  ["p2", "KR-250", "Kopi Robusta 250g", "Coffee", "pack", 36000, 12, 30, 62],
  ["p3", "KC-500", "Kopi Cold Brew 500ml", "Coffee", "bottle", 27000, 0, 20, 44],
  ["p4", "TM-100", "Teh Melati 100g", "Tea", "pack", 14000, 14, 25, 70],
  ["p5", "TH-100", "Teh Hijau 100g", "Tea", "pack", 16000, 97, 25, 52],
  ["p6", "TB-020", "Teh Celup Box 20s", "Tea", "box", 12000, 154, 30, 84],
  ["p7", "GA-001", "Gula Aren 1kg", "Sugar & syrup", "kg", 32000, 6, 20, 36],
  ["p8", "GP-001", "Gula Pasir 1kg", "Sugar & syrup", "kg", 14000, 250, 40, 110],
  ["p9", "SG-250", "Sirup Gula Cair 250ml", "Sugar & syrup", "bottle", 15000, 48, 20, 46],
  ["p10", "MH-014", "Madu Hutan 500ml", "Honey", "bottle", 62000, 9, 15, 24],
  ["p11", "MK-250", "Madu Kelengkeng 250ml", "Honey", "bottle", 38000, 40, 15, 30],
  ["p12", "LM-100", "Lemon Madu Sachet", "Honey", "box", 21000, 33, 20, 38],
  ["p13", "CB-080", "Cokelat Batang 80g", "Snacks", "pcs", 11000, 125, 30, 96],
  ["p14", "KP-150", "Keripik Singkong 150g", "Snacks", "pack", 9000, 0, 30, 64],
  ["p15", "KS-200", "Kacang Sangrai 200g", "Snacks", "pack", 12000, 72, 30, 72],
];

// naik-turun penjualan per bulan (Jun..Nov). Pola tetap, bukan acak, supaya data contoh selalu sama.
const trend = [0.8, 0.88, 0.92, 0.86, 0.97, 1.0];
const wobble = (i: number, m: number) => 1 + (((i * 7 + m * 3) % 5) - 2) * 0.02;

const products = catalog.map(([id, sku, name, category, unit, cost, stock, min]) => ({ id, sku, name, category, unit, cost, price: price(cost), stock, min }));
const unitsSold: Record<string, number[]> = Object.fromEntries(
  catalog.map((c, i) => [c[0], months.map((_, m) => Math.round(c[8] * trend[m]! * wobble(i, m)))]),
);
const orders = months.map((_, m) => Math.round(catalog.reduce((s, c) => s + (unitsSold[c[0]]![m] ?? 0), 0) / 3.1));

// pembelian per supplier. Jun–Okt dibagi dengan porsi tetap; November sama dengan PO di halaman Purchasing.
const suppliers = [
  { id: "s1", name: "CV Kopi Priangan" },
  { id: "s2", name: "PT Sumber Teh Nusantara" },
  { id: "s3", name: "UD Gula Lestari" },
  { id: "s4", name: "Madu Hutan Sejahtera" },
  { id: "s5", name: "Pabrik Cokelat Dago" },
  { id: "s6", name: "Snack Jaya Mandiri" },
];
const monthlyTotal = [18200000, 20900000, 22400000, 19600000, 24100000];
const weight = [0.3, 0.2, 0.17, 0.12, 0.13, 0.08];
const november = [11322000, 3685200, 4417800, 2908200, 1831500, 1598400]; // total Rp 25.763.100
const purchases: Record<string, number[]> = Object.fromEntries(
  suppliers.map((s, i) => [s.id, [...monthlyTotal.map((t) => Math.round((t * weight[i]!) / 100) * 100), november[i]!]]),
);

const data: ReportData = {
  today: "2026-11-27", // dianggap "hari ini"
  months,
  pageSize: 8,
  categories: ["Coffee", "Tea", "Sugar & syrup", "Honey", "Snacks"],
  products,
  unitsSold,
  orders,
  // porsi pendapatan per pelanggan; sisanya dihitung sebagai "Walk-in & others"
  customers: [
    { name: "CV Maju Bersama", share: 0.17 },
    { name: "Toko Sinar Jaya", share: 0.13 },
    { name: "Resto Nusantara", share: 0.11 },
    { name: "Minimarket Berkah", share: 0.09 },
    { name: "Kafe Senja", share: 0.07 },
    { name: "Bakery Roti Hangat", share: 0.05 },
  ],
  suppliers,
  purchases,
};

export default function ReportsPage() {
  return <ReportsView data={data} />;
}
