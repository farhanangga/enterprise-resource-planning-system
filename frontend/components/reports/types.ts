export type ReportProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  cost: number; // harga beli per unit (Rp)
  price: number; // harga jual per unit, belum termasuk PPN (Rp)
  stock: number;
  min: number; // batas stok minimum
};

export type ReportSupplier = { id: string; name: string };

export type ReportData = {
  today: string; // YYYY-MM-DD
  months: string[]; // YYYY-MM berurutan; bulan terakhir = bulan berjalan (month to date)
  pageSize: number;
  categories: string[];
  products: ReportProduct[];
  unitsSold: Record<string, number[]>; // productId -> unit terjual per bulan (sejajar dengan `months`)
  orders: number[]; // jumlah order per bulan
  customers: { name: string; share: number }[]; // porsi pendapatan; sisanya = "Walk-in & others"
  suppliers: ReportSupplier[];
  purchases: Record<string, number[]>; // supplierId -> nilai pembelian per bulan (Rp)
};

export type Period = "month" | "3m" | "6m";

export type Delta = { pct: number; label: string } | null;
