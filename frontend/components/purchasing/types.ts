export type PoStatus = "draft" | "ordered" | "received" | "cancelled";
export type PayStatus = "unpaid" | "partial" | "paid";
export type PayMethod = "cash" | "transfer" | "qris" | "card";
export type DeliveryState = "none" | "partial" | "full";

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  city: string;
  termDays: number; // tempo pembayaran (hari). 0 = bayar langsung.
  leadDays: number; // perkiraan lama pengiriman (hari)
};

export type PurchaseProduct = { id: string; sku: string; name: string; unit: string; cost: number; stock: number; min: number };

export type Warehouse = { id: string; name: string; city: string };

export type PoItem = { productId: string; qty: number; cost: number };

export type PurchaseOrder = {
  id: string;
  number: string;
  supplierId: string;
  date: string; // YYYY-MM-DD
  expectedDate: string; // perkiraan barang tiba
  dueDate: string; // jatuh tempo tagihan supplier
  status: PoStatus;
  items: PoItem[];
  discount: number; // potongan harga (Rp), berlaku untuk seluruh PO
  note: string;
  createdBy: string;
};

/** Penerimaan barang. Jumlah diterima per item dihitung dari data ini. */
export type Receipt = {
  id: string;
  poId: string;
  date: string;
  warehouseId: string;
  by: string;
  lines: { productId: string; qty: number }[];
};

export type SupplierPayment = {
  id: string;
  poId: string;
  date: string;
  amount: number;
  method: PayMethod;
  ref: string;
  by: string;
};

/** PO beserta angka-angka turunannya */
export type PoCalc = {
  order: PurchaseOrder;
  total: number;
  paid: number;
  balance: number;
  pay: PayStatus;
  overdue: boolean; // tagihan lewat jatuh tempo
  units: number; // total jumlah dipesan
  receivedUnits: number; // total jumlah diterima
  delivery: DeliveryState;
  late: boolean; // barang belum lengkap padahal lewat tanggal perkiraan
};

export type PurchasingData = {
  today: string; // YYYY-MM-DD (dianggap "hari ini")
  taxRate: number; // PPN, mis. 0.11
  pageSize: number;
  methods: { value: PayMethod; label: string }[];
  warehouses: Warehouse[];
  suppliers: Supplier[];
  products: PurchaseProduct[];
  orders: PurchaseOrder[];
  receipts: Receipt[];
  payments: SupplierPayment[];
};
