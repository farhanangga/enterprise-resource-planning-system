export type OrderStatus = "draft" | "confirmed" | "shipped" | "completed" | "cancelled";
export type PayStatus = "unpaid" | "partial" | "paid";
export type PayMethod = "cash" | "transfer" | "qris" | "card";

export type Customer = { id: string; name: string; phone: string; city: string; termDays: number };

export type SaleProduct = { id: string; sku: string; name: string; unit: string; price: number; stock: number };

export type OrderItem = { productId: string; qty: number; price: number };

export type Order = {
  id: string;
  number: string;
  customerId: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: OrderStatus;
  items: OrderItem[];
  discount: number; // potongan harga (Rp), berlaku untuk seluruh order
  note: string;
  createdBy: string; // nama pembuat order
};

export type Payment = {
  id: string;
  orderId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  method: PayMethod;
  ref: string;
  by: string;
};

/** Order beserta angka-angka turunannya */
export type OrderCalc = {
  order: Order;
  total: number;
  paid: number;
  balance: number;
  pay: PayStatus;
  overdue: boolean;
};

export type SalesData = {
  today: string; // YYYY-MM-DD (dianggap "hari ini")
  taxRate: number; // PPN, mis. 0.11
  pageSize: number;
  methods: { value: PayMethod; label: string }[];
  customers: Customer[];
  products: SaleProduct[];
  orders: Order[];
  payments: Payment[];
};
