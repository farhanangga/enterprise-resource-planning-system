"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/dashboard/app-context";
import Chip from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnGhost, btnPrimary } from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import { addDays, calcPo, fmtDate, idr, isOpenBill, payMeta, poMeta, receivedMap } from "./helpers";
import NewPurchaseModal, { type NewPoPayload } from "./NewPurchaseModal";
import { Empty, Kpi, Pager, SearchBox, Select } from "./parts";
import PaymentModal, { type PaymentPayload } from "./PaymentModal";
import PurchaseModal from "./PurchaseModal";
import ReceiveModal, { type ReceivePayload } from "./ReceiveModal";
import type { PayStatus, PoCalc, PoStatus, PurchaseOrder, PurchasingData, Receipt, SupplierPayment } from "./types";

type Tab = "orders" | "suppliers" | "payments";
type PayFilter = "all" | PayStatus | "overdue";
type Sort = "new" | "old" | "total";

/** Kolom pengiriman: progres barang diterima + perkiraan tiba */
function Delivery({ c }: { c: PoCalc }) {
  const { order } = c;
  if (order.status !== "ordered" && order.status !== "received") return <span className="text-[#5d4a52]">—</span>;
  const pct = c.units ? Math.round((c.receivedUnits / c.units) * 100) : 0;
  return (
    <div className="grid w-36 gap-1">
      <span className="flex items-center justify-between gap-2 text-xs font-semibold">
        <span className="tabular-nums">
          {c.receivedUnits} / {c.units} units
        </span>
        {c.late && <Chip tone="red">Late</Chip>}
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-[#1f1218]/10">
        <span className={`block h-full rounded-full ${pct === 100 ? "bg-[#1f1218]" : "bg-[#ff9d66]"}`} style={{ width: `${pct}%` }} />
      </span>
      {order.status === "ordered" && <span className="text-xs text-[#5d4a52]">Expected {fmtDate(order.expectedDate)}</span>}
    </div>
  );
}

export default function PurchasingView({ data }: { data: PurchasingData }) {
  const { user, can, role, roleInfo } = useApp();

  const [orders, setOrders] = useState<PurchaseOrder[]>(data.orders);
  const [receipts, setReceipts] = useState<Receipt[]>(data.receipts);
  const [payments, setPayments] = useState<SupplierPayment[]>(data.payments);
  const [tab, setTab] = useState<Tab>("orders");

  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<"all" | PoStatus>("all");
  const [payF, setPayF] = useState<PayFilter>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [page, setPage] = useState(1);
  const [sq, setSq] = useState("");
  const [spage, setSpage] = useState(1);
  const [pq, setPq] = useState("");
  const [ppage, setPpage] = useState(1);

  const [newPo, setNewPo] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [receiveId, setReceiveId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ open: boolean; poId?: string }>({ open: false });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const canView = can("purchasing:view");
  const canCreate = can("purchasing:create");
  const canManage = can("purchasing:manage");
  const canReceive = can("purchasing:receive");
  const canPay = can("purchasing:payment");
  const canAll = can("purchasing:all");

  const supplierOf = (id: string) => data.suppliers.find((s) => s.id === id);

  // peran tanpa "purchasing:all" hanya melihat PO buatannya sendiri
  const mine = useMemo(() => (canAll ? orders : orders.filter((o) => o.createdBy === user.name)), [orders, canAll, user.name]);
  const calcs = useMemo<PoCalc[]>(
    () => mine.map((o) => calcPo(o, payments, receipts, data.taxRate, data.today)),
    [mine, payments, receipts, data.taxRate, data.today],
  );

  /* ---------- KPI ---------- */
  const month = data.today.slice(0, 7);
  const monthLabel = new Date(`${data.today}T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const open = calcs.filter((c) => isOpenBill(c.order.status));
  const openMonth = open.filter((c) => c.order.date.startsWith(month));
  const spend = openMonth.reduce((s, c) => s + c.total, 0);
  const awaiting = calcs.filter((c) => c.order.status === "ordered" && c.delivery !== "full");
  const lateCount = awaiting.filter((c) => c.late).length;
  const visibleIds = new Set(calcs.map((c) => c.order.id));
  const unitsIn = receipts
    .filter((r) => visibleIds.has(r.poId) && r.date.startsWith(month))
    .reduce((s, r) => s + r.lines.reduce((a, l) => a + l.qty, 0), 0);
  const outstanding = open.reduce((s, c) => s + c.balance, 0);
  const overdueList = open.filter((c) => c.overdue);
  const overdueAmt = overdueList.reduce((s, c) => s + c.balance, 0);

  const kpis: { icon: IconName; label: string; value: string; note: string }[] = [
    { icon: "cart", label: canAll ? `Purchases · ${monthLabel}` : `My purchases · ${monthLabel}`, value: idr(spend), note: `${openMonth.length} order${openMonth.length === 1 ? "" : "s"} this month` },
    { icon: "clock", label: "Awaiting delivery", value: String(awaiting.length), note: lateCount > 0 ? `${lateCount} past the expected date` : "All on schedule" },
    { icon: "inventory", label: "Units received", value: unitsIn.toLocaleString("id-ID"), note: `${monthLabel}, added to stock` },
    ...(canAll || canPay
      ? [
          { icon: "finance" as IconName, label: "Payable", value: idr(outstanding), note: "Unpaid balance on supplier bills" },
          { icon: "alert" as IconName, label: "Overdue", value: idr(overdueAmt), note: `${overdueList.length} bill${overdueList.length === 1 ? "" : "s"} past due date` },
        ]
      : []),
  ];
  const kpiCols: Record<number, string> = { 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5" };

  /* ---------- daftar PO ---------- */
  const searched = useMemo(() => {
    const t = q.trim().toLowerCase();
    return calcs.filter((c) => {
      const match = !t || c.order.number.toLowerCase().includes(t) || (supplierOf(c.order.supplierId)?.name ?? "").toLowerCase().includes(t);
      const payOk = payF === "all" || (payF === "overdue" ? c.overdue : isOpenBill(c.order.status) && c.pay === payF);
      return match && payOk;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcs, q, payF]);

  const counts = useMemo(() => {
    const c: Record<"all" | PoStatus, number> = { all: searched.length, draft: 0, ordered: 0, received: 0, cancelled: 0 };
    searched.forEach((x) => c[x.order.status]++);
    return c;
  }, [searched]);

  const rows = useMemo(() => {
    const list = searched.filter((c) => statusF === "all" || c.order.status === statusF);
    return [...list].sort((a, b) =>
      sort === "total" ? b.total - a.total : sort === "old" ? a.order.date.localeCompare(b.order.date) : b.order.date.localeCompare(a.order.date) || b.order.number.localeCompare(a.order.number),
    );
  }, [searched, statusF, sort]);

  const oPages = Math.max(1, Math.ceil(rows.length / data.pageSize));
  const oCurrent = Math.min(page, oPages);
  const pageRows = rows.slice((oCurrent - 1) * data.pageSize, oCurrent * data.pageSize);

  /* ---------- supplier ---------- */
  const supplierRows = useMemo(() => {
    const t = sq.trim().toLowerCase();
    return data.suppliers
      .map((s) => {
        const list = calcs.filter((x) => x.order.supplierId === s.id && x.order.status !== "cancelled");
        const bk = list.filter((x) => isOpenBill(x.order.status));
        return { s, orders: list.length, total: bk.reduce((a, x) => a + x.total, 0), balance: bk.reduce((a, x) => a + x.balance, 0), overdue: bk.some((x) => x.overdue) };
      })
      .filter((r) => !t || r.s.name.toLowerCase().includes(t) || r.s.city.toLowerCase().includes(t))
      .sort((a, b) => b.total - a.total);
  }, [data.suppliers, calcs, sq]);
  const sPages = Math.max(1, Math.ceil(supplierRows.length / data.pageSize));
  const sCurrent = Math.min(spage, sPages);
  const sPageRows = supplierRows.slice((sCurrent - 1) * data.pageSize, sCurrent * data.pageSize);

  /* ---------- pembayaran ---------- */
  const methodLabel = (m: string) => data.methods.find((x) => x.value === m)?.label ?? m;
  const paymentRows = useMemo(() => {
    const t = pq.trim().toLowerCase();
    const byPo = new Map(calcs.map((c) => [c.order.id, c.order]));
    return payments
      .filter((p) => byPo.has(p.poId))
      .map((p) => ({ p, order: byPo.get(p.poId)! }))
      .filter(({ p, order }) => !t || order.number.toLowerCase().includes(t) || (supplierOf(order.supplierId)?.name ?? "").toLowerCase().includes(t) || p.ref.toLowerCase().includes(t))
      .sort((a, b) => b.p.date.localeCompare(a.p.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, calcs, pq]);
  const pPages = Math.max(1, Math.ceil(paymentRows.length / data.pageSize));
  const pCurrent = Math.min(ppage, pPages);
  const pPageRows = paymentRows.slice((pCurrent - 1) * data.pageSize, pCurrent * data.pageSize);
  const paidMonth = paymentRows.filter((r) => r.p.date.startsWith(month)).reduce((s, r) => s + r.p.amount, 0);

  const payable = calcs.filter((c) => isOpenBill(c.order.status) && c.balance > 0);

  /* ---------- aksi ---------- */
  const nextNumber = () => `PO-${Math.max(2000, ...orders.map((o) => parseInt(o.number.replace(/\D/g, ""), 10) || 0)) + 1}`;

  function createPo(p: NewPoPayload) {
    const sup = supplierOf(p.supplierId);
    const order: PurchaseOrder = {
      id: `po${Date.now()}`,
      number: nextNumber(),
      supplierId: p.supplierId,
      date: p.date,
      expectedDate: p.expectedDate,
      dueDate: addDays(p.date, sup?.termDays ?? 0),
      status: p.place ? "ordered" : "draft",
      items: p.items,
      discount: p.discount,
      note: p.note,
      createdBy: user.name,
    };
    setOrders([order, ...orders]);
    setNewPo(false);
    setPage(1);
    setToast(`${order.number} ${p.place ? "created and placed" : "saved as draft"}`);
  }

  function changeStatus(id: string, to: PoStatus) {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    setOrders(orders.map((x) => (x.id === id ? { ...x, status: to } : x)));
    setToast(`${o.number} is now ${poMeta[to].label.toLowerCase()}`);
  }

  // Catatan produksi: simpan penerimaan lewat API dan catat stock_movements (type "in", reference purchase_order).
  function receiveGoods(p: ReceivePayload) {
    const o = orders.find((x) => x.id === p.poId);
    if (!o) return;
    const receipt: Receipt = { id: `r${Date.now()}`, poId: p.poId, date: p.date, warehouseId: p.warehouseId, by: user.name, lines: p.lines };
    const nextReceipts = [receipt, ...receipts];
    const done = calcPo(o, payments, nextReceipts, data.taxRate, data.today).delivery === "full";
    setReceipts(nextReceipts);
    if (done) setOrders(orders.map((x) => (x.id === o.id ? { ...x, status: "received" } : x)));
    setReceiveId(null);
    const units = p.lines.reduce((s, l) => s + l.qty, 0);
    setToast(`${units} unit${units === 1 ? "" : "s"} received on ${o.number}${done ? " · order complete" : ""}`);
  }

  function recordPayment(p: PaymentPayload) {
    const pay: SupplierPayment = { id: `pay${Date.now()}`, ...p, by: user.name };
    const o = orders.find((x) => x.id === p.poId);
    setPayments([pay, ...payments]);
    setPayModal({ open: false });
    setToast(`${idr(p.amount)} paid${o ? ` for ${o.number}` : ""}`);
  }

  function clearFilters() {
    setQ("");
    setStatusF("all");
    setPayF("all");
    setPage(1);
  }

  /* ---------- tanpa akses ---------- */
  if (!canView) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <Reveal variant="scale">
          <div className="rounded-[28px] border border-[#1f1218]/10 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ff9d66]/25">
              <Icon name="shield" className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-black tracking-tight">No access to Purchasing</h1>
            <p className="mt-2 text-[#5d4a52]">The {roleInfo[role].label} role can’t open this page. Ask an Owner or Admin if you need access.</p>
            <Link href="/dashboard/main" className={`${btnPrimary} mt-6`}>
              Back to dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: canAll ? "Purchase orders" : "My purchase orders" },
    ...(canAll ? [{ id: "suppliers" as Tab, label: "Suppliers" }] : []),
    ...(canPay ? [{ id: "payments" as Tab, label: "Payments" }] : []),
  ];

  const detail = detailId ? calcs.find((c) => c.order.id === detailId) : undefined;
  const receiving = receiveId ? orders.find((o) => o.id === receiveId) : undefined;
  const statusChips: ["all" | PoStatus, string][] = [
    ["all", "All"],
    ["draft", "Draft"],
    ["ordered", "Ordered"],
    ["received", "Received"],
    ["cancelled", "Cancelled"],
  ];

  return (
    <div className="mx-auto grid max-w-[1320px] gap-5">
      {/* judul + aksi */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Purchasing</h1>
            <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
            <p className="mt-3 max-w-xl text-[#5d4a52]">
              {canAll ? "Order from suppliers, receive goods into stock, and keep track of what you owe." : "Create purchase orders and follow the ones you made."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canPay && (
              <button type="button" onClick={() => setPayModal({ open: true })} className={btnGhost}>
                <Icon name="finance" className="h-4 w-4" />
                Pay supplier
              </button>
            )}
            {canCreate && (
              <button type="button" onClick={() => setNewPo(true)} className={btnPrimary}>
                <Icon name="plus" className="h-4 w-4" />
                New purchase order
              </button>
            )}
            {!canCreate && !canPay && <Chip tone="soft">View only</Chip>}
          </div>
        </div>
      </Reveal>

      {/* KPI */}
      <div className={`grid gap-4 sm:grid-cols-2 ${kpiCols[kpis.length] ?? "xl:grid-cols-4"}`}>
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={60 + i * 60} className="h-full">
            <Kpi {...k} />
          </Reveal>
        ))}
      </div>

      {/* tab */}
      {tabs.length > 1 && (
        <Reveal delay={150}>
          <div role="tablist" aria-label="Purchasing sections" className="inline-flex flex-wrap gap-1 rounded-full bg-[#1f1218]/[0.06] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${tab === t.id ? "bg-[#1f1218] text-white" : "text-[#5d4a52] hover:text-[#1f1218]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* ===== PURCHASE ORDER ===== */}
      {tab === "orders" && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label="Search purchase orders" value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Search PO or supplier…" />
              {(canAll || canPay) && (
                <Select label="Payment" value={payF} onChange={(v) => (setPayF(v as PayFilter), setPage(1))}>
                  <option value="all">All payments</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partially paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </Select>
              )}
              <div className="sm:ml-auto">
                <Select label="Sort by" value={sort} onChange={(v) => setSort(v as Sort)}>
                  <option value="new">Sort: Newest</option>
                  <option value="old">Sort: Oldest</option>
                  <option value="total">Sort: Highest total</option>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#1f1218]/10 px-4 py-3 sm:px-5">
              {statusChips.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={statusF === id}
                  onClick={() => (setStatusF(id), setPage(1))}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
                    statusF === id ? "bg-[#1f1218] text-white" : "bg-[#1f1218]/[0.06] text-[#1f1218] hover:bg-[#ff9d66]/30"
                  }`}
                >
                  {label}
                  <span className={`rounded-full px-1.5 text-[11px] ${statusF === id ? "bg-white/20" : "bg-white"}`}>{counts[id]}</span>
                </button>
              ))}
            </div>

            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Purchase order</th>
                    <th className="px-3 py-3">Supplier</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Delivery</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="py-3 pl-3 pr-5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((c) => {
                    const sup = supplierOf(c.order.supplierId);
                    const bill = isOpenBill(c.order.status);
                    const receivable = canReceive && c.order.status === "ordered" && c.delivery !== "full";
                    return (
                      <tr key={c.order.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <b className="block">{c.order.number}</b>
                          <span className="text-xs text-[#5d4a52]">{fmtDate(c.order.date)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <b className="block font-semibold">{sup?.name ?? "—"}</b>
                          <span className="text-xs text-[#5d4a52]">{canAll ? `by ${c.order.createdBy}` : sup?.city}</span>
                        </td>
                        <td className="px-3 py-3">
                          <Chip tone={poMeta[c.order.status].tone}>{poMeta[c.order.status].label}</Chip>
                        </td>
                        <td className="px-3 py-3">
                          <Delivery c={c} />
                        </td>
                        <td className="px-3 py-3">
                          {bill ? (
                            <div className="flex flex-col items-start gap-1">
                              <span className="flex gap-1.5">
                                <Chip tone={payMeta[c.pay].tone}>{payMeta[c.pay].label}</Chip>
                                {c.overdue && <Chip tone="red">Overdue</Chip>}
                              </span>
                              {c.balance > 0 && <span className="text-xs text-[#5d4a52]">{idr(c.balance)} due {fmtDate(c.order.dueDate)}</span>}
                            </div>
                          ) : (
                            <span className="text-[#5d4a52]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-bold tabular-nums">{idr(c.total)}</td>
                        <td className="py-3 pl-3 pr-5">
                          <div className="flex justify-end gap-2">
                            {receivable && (
                              <button
                                type="button"
                                onClick={() => setReceiveId(c.order.id)}
                                className="rounded-full bg-[#ff9d66]/30 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 hover:bg-[#ff9d66]"
                              >
                                Receive
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDetailId(c.order.id)}
                              className="rounded-full border border-[#1f1218]/15 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 hover:bg-[#ff9d66]/30"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && <Empty title="No purchase orders found" text="Try a different search or clear the filters." onClear={clearFilters} />}
            </div>

            <Pager page={page} size={data.pageSize} total={rows.length} onPage={setPage} />
          </section>
        </Reveal>
      )}

      {/* ===== SUPPLIER ===== */}
      {tab === "suppliers" && canAll && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label="Search suppliers" value={sq} onChange={(v) => (setSq(v), setSpage(1))} placeholder="Search name or city…" />
              <p className="text-sm text-[#5d4a52] sm:ml-auto">{supplierRows.length} suppliers</p>
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Supplier</th>
                    <th className="px-3 py-3">Terms</th>
                    <th className="px-3 py-3 text-right">Orders</th>
                    <th className="px-3 py-3 text-right">Total purchases</th>
                    {canPay && <th className="py-3 pl-3 pr-5 text-right">We owe</th>}
                  </tr>
                </thead>
                <tbody>
                  {sPageRows.map(({ s, orders: n, total, balance, overdue }) => (
                    <tr key={s.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                      <td className="py-3 pl-5 pr-3">
                        <b className="block">{s.name}</b>
                        <span className="text-xs text-[#5d4a52]">
                          {s.city}
                          {s.phone ? ` · ${s.phone}` : ""}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="block">{s.termDays > 0 ? `${s.termDays} days` : "Pay on delivery"}</span>
                        <span className="text-xs text-[#5d4a52]">About {s.leadDays} days to deliver</span>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{n}</td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums">{idr(total)}</td>
                      {canPay && (
                        <td className="py-3 pl-3 pr-5 text-right">
                          <span className="flex items-center justify-end gap-2">
                            {overdue && <Chip tone="red">Overdue</Chip>}
                            <b className="tabular-nums">{idr(balance)}</b>
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {supplierRows.length === 0 && <Empty title="No suppliers found" text="Try a different search." />}
            </div>
            <Pager page={spage} size={data.pageSize} total={supplierRows.length} onPage={setSpage} />
          </section>
        </Reveal>
      )}

      {/* ===== PEMBAYARAN ===== */}
      {tab === "payments" && canPay && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label="Search payments" value={pq} onChange={(v) => (setPq(v), setPpage(1))} placeholder="Search PO, supplier, or reference…" />
              <p className="text-sm text-[#5d4a52] sm:ml-auto">
                Paid out in {monthLabel}: <b className="text-[#1f1218]">{idr(paidMonth)}</b>
              </p>
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Date</th>
                    <th className="px-3 py-3">Purchase order</th>
                    <th className="px-3 py-3">Supplier</th>
                    <th className="px-3 py-3">Method</th>
                    <th className="px-3 py-3">Reference</th>
                    <th className="py-3 pl-3 pr-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pPageRows.map(({ p, order }) => (
                    <tr key={p.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                      <td className="py-3 pl-5 pr-3">{fmtDate(p.date)}</td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => setDetailId(order.id)} className="font-bold underline-offset-4 hover:underline">
                          {order.number}
                        </button>
                      </td>
                      <td className="px-3 py-3">{supplierOf(order.supplierId)?.name ?? "—"}</td>
                      <td className="px-3 py-3">
                        <Chip tone="soft">{methodLabel(p.method)}</Chip>
                      </td>
                      <td className="px-3 py-3 text-[#5d4a52]">{p.ref || "—"}</td>
                      <td className="py-3 pl-3 pr-5 text-right font-bold tabular-nums">{idr(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paymentRows.length === 0 && <Empty title="No payments found" text="Try a different search." />}
            </div>
            <Pager page={ppage} size={data.pageSize} total={paymentRows.length} onPage={setPpage} />
          </section>
        </Reveal>
      )}

      {/* modal */}
      {newPo && (
        <NewPurchaseModal
          suppliers={data.suppliers}
          products={data.products}
          today={data.today}
          taxRate={data.taxRate}
          canPlace={canManage}
          onClose={() => setNewPo(false)}
          onSubmit={createPo}
        />
      )}
      {detail && (
        <PurchaseModal
          key={detail.order.id}
          calc={detail}
          supplier={supplierOf(detail.order.supplierId)}
          products={data.products}
          warehouses={data.warehouses}
          receipts={receipts}
          payments={payments}
          methods={data.methods}
          taxRate={data.taxRate}
          canManage={canManage}
          canReceive={canReceive}
          canPay={canPay}
          onClose={() => setDetailId(null)}
          onStatus={(to) => changeStatus(detail.order.id, to)}
          onReceive={() => setReceiveId(detail.order.id)}
          onPay={() => setPayModal({ open: true, poId: detail.order.id })}
        />
      )}
      {receiving && (
        <ReceiveModal
          key={receiving.id}
          order={receiving}
          got={receivedMap(receiving.id, receipts)}
          products={data.products}
          warehouses={data.warehouses}
          today={data.today}
          onClose={() => setReceiveId(null)}
          onSubmit={receiveGoods}
        />
      )}
      {payModal.open && (
        <PaymentModal
          payable={payable}
          suppliers={data.suppliers}
          methods={data.methods}
          today={data.today}
          initialPoId={payModal.poId}
          onClose={() => setPayModal({ open: false })}
          onSubmit={recordPayment}
        />
      )}

      {/* toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1f1218] px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#ff9d66] text-[#1f1218]">
          <Icon name="check" className="h-3 w-3" />
        </span>
        {toast}
      </div>
    </div>
  );
}
