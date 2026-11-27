export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  cost: number; // harga modal (Rp)
  price: number; // harga jual (Rp)
  min: number; // batas stok minimum (total semua gudang)
  stock: Record<string, number>; // stok per gudang: { [warehouseId]: jumlah }
  active: boolean;
};

export type Warehouse = { id: string; name: string; city: string };

export type MovementType = "in" | "out" | "adjust";

export type Movement = {
  id: string;
  date: string;
  productId: string;
  product: string;
  type: MovementType;
  qty: number; // bertanda: + masuk, - keluar
  warehouseId: string;
  ref: string;
  by: string;
};

export type InventoryData = {
  pageSize: number;
  categories: string[];
  units: string[];
  warehouses: Warehouse[];
  products: Product[];
  movements: Movement[];
};
