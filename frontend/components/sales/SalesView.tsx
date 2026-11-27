"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useApp } from "@/components/dashboard/app-context";
import Chip from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnGhost, btnPrimary } from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import { addDays, calcOrder, fmtDate, idr, isBooked, orderMeta, payMeta } from "./helpers";
import NewSaleModal, { type NewSalePayload } from "./NewSaleModal";
import OrderModal from "./OrderModal";
import PaymentModal, { type PaymentPayload } from "./PaymentModal";
import type { Order, OrderCalc, OrderStatus, PayStatus, Payment, SalesData } from "./types";

type Tab = "orders" | "customers" | "payments";
type PayFilter = "all" | PayStatus | "overdue";
type Sort = "new" | "old" | "total";

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-[#1f1218]/10 bg-white pl-4 pr-9 text-sm font-semibold outline-none transition hover:border-[#1f1218]/30 focus:border-[#ff9d66] focus:ring-4 focus:ring-[#ff9d66]/25"
      >
        {children}
      </select>
      <Icon name="chevron" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
    </label>
  );
}

function SearchBox({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="group relative w-full sm:w-72">
      <span className="sr-only">{label}</span>
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5d4a52] transition-colors group-focus-within:text-[#e8641f]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-[#1f1218]/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#5d4a52]/60 focus:border-[#ff9d66] focus:ring-4 focus:ring-[#ff9d66]/25"
      />
    </label>
  );
}

function Kpi({ icon, label, value, note }: { icon: IconName; label: string; value: string; note: string }) {
  return (
    <div className="group h-full rounded-[24px] border border-[#1f1218]/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9d66] hover:shadow-[0_18px_40px_-22px_rgba(255,157,102,.9)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff9d66]/25 transition-colors duration-300 group-hover:bg-[#ff9d66]">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#5d4a52]">{label}</p>
      <p className="mt-1 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#5d4a52]">{note}</p>
    </div>
  );
}

function Pager({ page, size, total, onPage }: { page: number; size: number; total: number; onPage: (n: number) => void }) {
  if (total === 0) return null;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, pages);
  const arrow =
    "grid h-9 w-9 place-items-center rounded-full border border-[#1f1218]/15 transition-colors duration-200 hover:bg-[#ff9d66]/30 disabled:pointer-events-none disabled:opacity-40";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1f1218]/10 px-4 py-3 text-sm sm:px-5">
      <p className="text-[#5d4a52]">
        Showing {(current - 1) * size + 1}–{Math.min(current * size, total)} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPage(current - 1)} disabled={current === 1} aria-label="Previous page" className={arrow}>
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === current ? "page" : undefined}
            className={`h-9 min-w-9 rounded-full px-3 text-xs font-bold transition-colors duration-200 ${n === current ? "bg-[#1f1218] text-white" : "hover:bg-[#ff9d66]/30"}`}
          >
            {n}
          </button>
        ))}
        <button type="button" onClick={() => onPage(current + 1)} disabled={current === pages} aria-label="Next page" className={arrow}>
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Empty({ title, text, onClear }: { title: string; text: string; onClear?: () => void }) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm text-[#5d4a52]">{text}</p>
      {onClear && (
        <button type="button" onClick={onClear} className={`${btnGhost} mt-4`}>
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function SalesView({ data }: { data: SalesData }) {
  const { user, can, role, roleInfo } = useApp();

  const [orders, setOrders] = useState<Order[]>(data.orders);
  const [payments, setPayments] = useState<Payment[]>(data.payments);
  const [tab, setTab] = useState<Tab>("orders");

  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<"all" | OrderStatus>("all");
  const [payF, setPayF] = useState<PayFilter>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [page, setPage] = useState(1);
  const [cq, setCq] = useState("");
  const [cpage, setCpage] = useState(1);
  const [pq, setPq] = useState("");
  const [ppage, setPpage] = useState(1);

  const [newSale, setNewSale] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ open: boolean; orderId?: string }>({ open: false });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const canView = can("sales:view");
  const canCreate = can("sales:create");
  const canManage = can("sales:manage");
  const canPay = can("sales:payment");
  const canAll = can("sales:all");

  const customerOf = (id: string) => data.customers.find((c) => c.id === id);

  // peran tanpa "sales:all" hanya melihat order buatannya sendiri
  const mine = useMemo(() => (canAll ? orders : orders.filter((o) => o.createdBy === user.name)), [orders, canAll, user.name]);
  const calcs = useMemo<OrderCalc[]>(
    () => mine.map((o) => calcOrder(o, payments, data.taxRate, data.today)),
    [mine, payments, data.taxRate, data.today],
  );

  /* ---------- KPI ---------- */
  const month = data.today.slice(0, 7);
  const monthLabel = new Date(`${data.today}T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const booked = calcs.filter((c) => isBooked(c.order.status));
  const bookedMonth = booked.filter((c) => c.order.date.startsWith(month));
  const revenue = bookedMonth.reduce((s, c) => s + c.total, 0);
  const unitsSold = bookedMonth.reduce((s, c) => s + c.order.items.reduce((a, i) => a + i.qty, 0), 0);
  const openCount = calcs.filter((c) => ["draft", "confirmed", "shipped"].includes(c.order.status)).length;
  const outstanding = booked.reduce((s, c) => s + c.balance, 0);
  const overdueList = booked.filter((c) => c.overdue);
  const overdueAmt = overdueList.reduce((s, c) => s + c.balance, 0);

  const kpis: { icon: IconName; label: string; value: string; note: string }[] = [
    { icon: "sales", label: canAll ? `Revenue · ${monthLabel}` : `My revenue · ${monthLabel}`, value: idr(revenue), note: `${bookedMonth.length} orders this month` },
    { icon: "cart", label: canAll ? "Open orders" : "My open orders", value: String(openCount), note: "Draft, confirmed, or shipped" },
    { icon: "inventory", label: "Units sold", value: unitsSold.toLocaleString("id-ID"), note: monthLabel },
    ...(canAll || canPay
      ? [
          { icon: "finance" as IconName, label: "Outstanding", value: idr(outstanding), note: "Unpaid balance on active orders" },
          { icon: "alert" as IconName, label: "Overdue", value: idr(overdueAmt), note: `${overdueList.length} order${overdueList.length === 1 ? "" : "s"} past due date` },
        ]
      : []),
  ];
  const kpiCols: Record<number, string> = { 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5" };

  /* ---------- daftar order ---------- */
  const searched = useMemo(() => {
    const t = q.trim().toLowerCase();
    return calcs.filter((c) => {
      const match = !t || c.order.number.toLowerCase().includes(t) || (customerOf(c.order.customerId)?.name ?? "").toLowerCase().includes(t);
      const payOk = payF === "all" || (payF === "overdue" ? c.overdue : isBooked(c.order.status) && c.pay === payF);
      return match && payOk;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcs, q, payF]);

  const counts = useMemo(() => {
    const c: Record<"all" | OrderStatus, number> = { all: searched.length, draft: 0, confirmed: 0, shipped: 0, completed: 0, cancelled: 0 };
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

  /* ---------- pelanggan ---------- */
  const customerRows = useMemo(() => {
    const t = cq.trim().toLowerCase();
    return data.customers
      .map((c) => {
        const mineOrders = calcs.filter((x) => x.order.customerId === c.id && x.order.status !== "cancelled");
        const bk = mineOrders.filter((x) => isBooked(x.order.status));
        return { c, orders: mineOrders.length, total: bk.reduce((s, x) => s + x.total, 0), balance: bk.reduce((s, x) => s + x.balance, 0), overdue: bk.some((x) => x.overdue) };
      })
      .filter((r) => !t || r.c.name.toLowerCase().includes(t) || r.c.city.toLowerCase().includes(t))
      .sort((a, b) => b.total - a.total);
  }, [data.customers, calcs, cq]);
  const cPages = Math.max(1, Math.ceil(customerRows.length / data.pageSize));
  const cCurrent = Math.min(cpage, cPages);
  const cPageRows = customerRows.slice((cCurrent - 1) * data.pageSize, cCurrent * data.pageSize);

  /* ---------- pembayaran ---------- */
  const methodLabel = (m: string) => data.methods.find((x) => x.value === m)?.label ?? m;
  const paymentRows = useMemo(() => {
    const t = pq.trim().toLowerCase();
    const byOrder = new Map(calcs.map((c) => [c.order.id, c.order]));
    return payments
      .filter((p) => byOrder.has(p.orderId))
      .map((p) => ({ p, order: byOrder.get(p.orderId)! }))
      .filter(
        ({ p, order }) =>
          !t || order.number.toLowerCase().includes(t) || (customerOf(order.customerId)?.name ?? "").toLowerCase().includes(t) || p.ref.toLowerCase().includes(t),
      )
      .sort((a, b) => b.p.date.localeCompare(a.p.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, calcs, pq]);
  const pPages = Math.max(1, Math.ceil(paymentRows.length / data.pageSize));
  const pCurrent = Math.min(ppage, pPages);
  const pPageRows = paymentRows.slice((pCurrent - 1) * data.pageSize, pCurrent * data.pageSize);
  const receivedMonth = paymentRows.filter((r) => r.p.date.startsWith(month)).reduce((s, r) => s + r.p.amount, 0);

  const payable = calcs.filter((c) => isBooked(c.order.status) && c.balance > 0);

  /* ---------- aksi ---------- */
  const nextNumber = () => `SO-${Math.max(1000, ...orders.map((o) => parseInt(o.number.replace(/\D/g, ""), 10) || 0)) + 1}`;

  function createOrder(p: NewSalePayload) {
    const cust = customerOf(p.customerId);
    const order: Order = {
      id: `o${Date.now()}`,
      number: nextNumber(),
      customerId: p.customerId,
      date: p.date,
      dueDate: addDays(p.date, cust?.termDays ?? 0),
      status: p.confirm ? "confirmed" : "draft",
      items: p.items,
      discount: p.discount,
      note: p.note,
      createdBy: user.name,
    };
    setOrders([order, ...orders]);
    setNewSale(false);
    setPage(1);
    setToast(`${order.number} ${p.confirm ? "created and confirmed" : "saved as draft"}`);
  }

  function changeStatus(id: string, to: OrderStatus) {
    const o = orders.find((x) => x.id === id);
    if (!o) return;
    setOrders(orders.map((x) => (x.id === id ? { ...x, status: to } : x)));
    setToast(`${o.number} is now ${orderMeta[to].label.toLowerCase()}`);
  }

  function recordPayment(p: PaymentPayload) {
    const pay: Payment = { id: `pay${Date.now()}`, ...p, by: user.name };
    const o = orders.find((x) => x.id === p.orderId);
    setPayments([pay, ...payments]);
    setPayModal({ open: false });
    setToast(`${idr(p.amount)} recorded${o ? ` for ${o.number}` : ""}`);
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
            <h1 className="mt-5 text-2xl font-black tracking-tight">No access to Sales</h1>
            <p className="mt-2 text-[#5d4a52]">The {roleInfo[role].label} role can’t open this page. Ask an Owner or Admin if you need access.</p>
            <Link href="/dashboard" className={`${btnPrimary} mt-6`}>
              Back to dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: canAll ? "Orders" : "My orders" },
    ...(canAll ? [{ id: "customers" as Tab, label: "Customers" }] : []),
    ...(canPay ? [{ id: "payments" as Tab, label: "Payments" }] : []),
  ];

  const detail = detailId ? calcs.find((c) => c.order.id === detailId) : undefined;
  const statusChips: ["all" | OrderStatus, string][] = [
    ["all", "All"],
    ["draft", "Draft"],
    ["confirmed", "Confirmed"],
    ["shipped", "Shipped"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ];

  return (
    <div className="mx-auto grid max-w-[1320px] gap-5">
      {/* judul + aksi */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Sales</h1>
            <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
            <p className="mt-3 max-w-xl text-[#5d4a52]">
              {canAll ? "Create orders, follow them to delivery, and keep track of what customers still owe." : "Create orders and follow the ones you made."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canPay && (
              <button type="button" onClick={() => setPayModal({ open: true })} className={btnGhost}>
                <Icon name="finance" className="h-4 w-4" />
                Record payment
              </button>
            )}
            {canCreate && (
              <button type="button" onClick={() => setNewSale(true)} className={btnPrimary}>
                <Icon name="plus" className="h-4 w-4" />
                New sale
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
          <div role="tablist" aria-label="Sales sections" className="inline-flex flex-wrap gap-1 rounded-full bg-[#1f1218]/[0.06] p-1">
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

      {/* ===== ORDER ===== */}
      {tab === "orders" && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label="Search orders" value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder="Search order or customer…" />
              <Select label="Payment" value={payF} onChange={(v) => (setPayF(v as PayFilter), setPage(1))}>
                <option value="all">All payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partially paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </Select>
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
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Order</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="py-3 pl-3 pr-5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((c) => {
                    const cust = customerOf(c.order.customerId);
                    const booked = isBooked(c.order.status);
                    return (
                      <tr key={c.order.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <b className="block">{c.order.number}</b>
                          <span className="text-xs text-[#5d4a52]">{fmtDate(c.order.date)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <b className="block font-semibold">{cust?.name ?? "—"}</b>
                          <span className="text-xs text-[#5d4a52]">{canAll ? `by ${c.order.createdBy}` : cust?.city}</span>
                        </td>
                        <td className="px-3 py-3">
                          <Chip tone={orderMeta[c.order.status].tone}>{orderMeta[c.order.status].label}</Chip>
                        </td>
                        <td className="px-3 py-3">
                          {booked ? (
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
                          <div className="flex justify-end">
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
              {rows.length === 0 && <Empty title="No orders found" text="Try a different search or clear the filters." onClear={clearFilters} />}
            </div>

            <Pager page={page} size={data.pageSize} total={rows.length} onPage={setPage} />
          </section>
        </Reveal>
      )}

      {/* ===== PELANGGAN ===== */}
      {tab === "customers" && canAll && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label="Search customers" value={cq} onChange={(v) => (setCq(v), setCpage(1))} placeholder="Search name or city…" />
              <p className="text-sm text-[#5d4a52] sm:ml-auto">{customerRows.length} customers</p>
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Customer</th>
                    <th className="px-3 py-3">Terms</th>
                    <th className="px-3 py-3 text-right">Orders</th>
                    <th className="px-3 py-3 text-right">Total sales</th>
                    {canPay && <th className="py-3 pl-3 pr-5 text-right">Outstanding</th>}
                  </tr>
                </thead>
                <tbody>
                  {cPageRows.map(({ c, orders: n, total, balance, overdue }) => (
                    <tr key={c.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                      <td className="py-3 pl-5 pr-3">
                        <b className="block">{c.name}</b>
                        <span className="text-xs text-[#5d4a52]">
                          {c.city}
                          {c.phone ? ` · ${c.phone}` : ""}
                        </span>
                      </td>
                      <td className="px-3 py-3">{c.termDays > 0 ? `${c.termDays} days` : "Pay now"}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{n}</td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums">{idr(total)}</td>
                      {canPay && (
                        <td className="py-3 pl-3 pr-5 text-right">
                          <span className="inline-flex items-center justify-end gap-2">
                            {overdue && <Chip tone="red">Overdue</Chip>}
                            <b className={`tabular-nums ${balance > 0 ? "" : "text-[#5d4a52]"}`}>{idr(balance)}</b>
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {customerRows.length === 0 && <Empty title="No customers found" text="Try a different search." />}
            </div>
            <Pager page={cpage} size={data.pageSize} total={customerRows.length} onPage={setCpage} />
          </section>
        </Reveal>
      )}

      {/* ===== PEMBAYARAN ===== */}
      {tab === "payments" && canPay && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label="Search payments" value={pq} onChange={(v) => (setPq(v), setPpage(1))} placeholder="Search order, customer, reference…" />
              <p className="text-sm text-[#5d4a52] sm:ml-auto">
                Received in {monthLabel}: <b className="font-black text-[#1f1218]">{idr(receivedMonth)}</b>
              </p>
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Date</th>
                    <th className="px-3 py-3">Order</th>
                    <th className="px-3 py-3">Customer</th>
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
                        <button type="button" onClick={() => setDetailId(order.id)} className="font-bold underline decoration-[#ff9d66] decoration-2 underline-offset-4 hover:text-[#e8641f]">
                          {order.number}
                        </button>
                      </td>
                      <td className="px-3 py-3">{customerOf(order.customerId)?.name ?? "—"}</td>
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
      {newSale && (
        <NewSaleModal
          customers={data.customers}
          products={data.products}
          today={data.today}
          taxRate={data.taxRate}
          canConfirm={canManage}
          onClose={() => setNewSale(false)}
          onSubmit={createOrder}
        />
      )}
      {detail && (
        <OrderModal
          key={detail.order.id}
          calc={detail}
          customer={customerOf(detail.order.customerId)}
          products={data.products}
          payments={payments}
          methods={data.methods}
          taxRate={data.taxRate}
          canManage={canManage}
          canPay={canPay}
          onClose={() => setDetailId(null)}
          onStatus={(to) => changeStatus(detail.order.id, to)}
          onPay={() => setPayModal({ open: true, orderId: detail.order.id })}
        />
      )}
      {payModal.open && (
        <PaymentModal
          payable={payable}
          customers={data.customers}
          methods={data.methods}
          today={data.today}
          initialOrderId={payModal.orderId}
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
