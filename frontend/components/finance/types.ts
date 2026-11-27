export type DocKind = "invoice" | "bill";
export type AccountType = "cash" | "bank" | "ewallet";
export type DocStatus = "unpaid" | "partial" | "paid";

export type Account = { id: string; name: string; type: AccountType; opening: number };

/** Transaksi kas/bank. Bila docId terisi, transaksi ini adalah pembayaran untuk invoice/bill tersebut. */
export type Txn = {
  id: string;
  date: string; // YYYY-MM-DD
  accountId: string;
  type: "in" | "out";
  amount: number;
  category: string;
  note: string;
  docId?: string;
  by: string;
};

/** Invoice ke pelanggan (piutang) atau bill dari supplier (utang). total sudah termasuk PPN. */
export type FinDoc = {
  id: string;
  kind: DocKind;
  number: string;
  ref?: string; // mis. nomor PO untuk bill
  party: string; // nama pelanggan / supplier
  date: string;
  dueDate: string;
  total: number;
};

export type DocCalc = {
  doc: FinDoc;
  paid: number;
  balance: number;
  status: DocStatus;
  overdue: boolean;
  daysLate: number; // > 0 bila lewat jatuh tempo
  payments: number; // jumlah pembayaran
};

export type FinanceData = {
  today: string;
  pageSize: number;
  accounts: Account[];
  categories: { in: string[]; out: string[] };
  docs: FinDoc[];
  txns: Txn[];
};
