"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/dashboard/app-context";
import { Empty, Kpi, Pager, Select } from "@/components/purchasing/parts";
import Chip from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnGhost, btnPrimary } from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import { BarList, MonthlyBars } from "./Charts";
import {
  delta, deltaText, downloadCsv, idr, monthShort, num, pct, periodLabel, periodRange, prevLabel, purchaseAgg, purchaseMonthly, rangeLabel, reorderQty, salesAgg, salesMonthly, stockAgg, stockState,
} from "./helpers";
import type { Period, ReportData } from "./types";

type Tab = "sales" | "purchasing" | "inventory";
type Sort = "revenue" | "units" | "margin";

const card = "rounded-[24px] border border-[#1f1218]/10 bg-white p-5 shadow-sm sm:p-6";
const th = "text-xs font-bold uppercase tracking-wider text-[#5d4a52]";

export default function ReportsView({ data }: { data: ReportData }) {
  const { can, role, roleInfo } = useApp();

  const [tab, setTab] = useState<Tab | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [sort, setSort] = useState<Sort>("revenue");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const canView = can("reports:view");
  const canCost = can("inventory:cost"); // nilai stok = data harga beli
  const tabs: { id: Tab; label: string; icon: IconName }[] = [
    ...(can("sales:view") ? [{ id: "sales" as Tab, label: "Sales", icon: "sales" as IconName }] : []),
    ...(can("purchasing:view") ? [{ id: "purchasing" as Tab, label: "Purchasing", icon: "cart" as IconName }] : []),
    ...(can("inventory:view") ? [{ id: "inventory" as Tab, label: "Inventory", icon: "inventory" as IconName }] : []),
  ];
  const active: Tab | undefined = tab && tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id;

  /* ---------- angka ---------- */
  const { idx, prev } = useMemo(() => periodRange(period, data.months), [period, data.months]);
  const range = rangeLabel(period, data.months);
  const vs = prevLabel(period, data.months);
  const fileRange = `${data.months[idx[0]!]}_${data.months[idx[idx.length - 1]!]}`;
  const labels = data.months.map(monthShort);

  const sales = useMemo(() => salesAgg(data, idx), [data, idx]);
  const salesPrev = useMemo(() => (prev ? salesAgg(data, prev) : null), [data, prev]);
  const salesSeries = useMemo(() => salesMonthly(data), [data]);
  const purch = useMemo(() => purchaseAgg(data, idx), [data, idx]);
  const purchPrev = useMemo(() => (prev ? purchaseAgg(data, prev) : null), [data, prev]);
  const purchSeries = useMemo(() => purchaseMonthly(data), [data]);
  const stock = useMemo(() => stockAgg(data), [data]);

  const sortedRows = useMemo(
    () => [...sales.rows].sort((a, b) => (sort === "units" ? b.units - a.units : sort === "margin" ? b.margin - a.margin : b.revenue - a.revenue)),
    [sales.rows, sort],
  );
  const current = Math.min(page, Math.max(1, Math.ceil(sortedRows.length / data.pageSize)));
  const pageRows = sortedRows.slice((current - 1) * data.pageSize, current * data.pageSize);

  const note = (cur: number, p: number | null) => deltaText(delta(cur, p, vs), range);
  const marginNote = salesPrev ? `${sales.margin - salesPrev.margin >= 0 ? "+" : "−"}${Math.abs(sales.margin - salesPrev.margin).toFixed(1).replace(".", ",")} pts ${vs}` : range;

  const customers = useMemo(() => {
    const named = data.customers.map((c) => ({ label: c.name, value: sales.revenue * c.share, text: idr(sales.revenue * c.share), sub: pct(c.share * 100, 0) }));
    const rest = 1 - data.customers.reduce((s, c) => s + c.share, 0);
    return [...named, { label: "Walk-in & others", value: sales.revenue * rest, text: idr(sales.revenue * rest), sub: pct(rest * 100, 0) }].sort((a, b) => b.value - a.value);
  }, [data.customers, sales.revenue]);

  /* ---------- ekspor ---------- */
  function exportCsv() {
    if (active === "sales") {
      downloadCsv(`etera-sales-${fileRange}.csv`, [
        ["Product", "SKU", "Category", "Units sold", "Revenue (Rp)", "Cost of goods (Rp)", "Gross profit (Rp)", "Margin (%)", "Share of revenue (%)"],
        ...sortedRows.map((r) => [r.p.name, r.p.sku, r.p.category, r.units, Math.round(r.revenue), Math.round(r.cost), Math.round(r.profit), r.margin.toFixed(1), r.share.toFixed(1)]),
        ["Total", "", "", sortedRows.reduce((s, r) => s + r.units, 0), Math.round(sales.revenue), Math.round(sales.cost), Math.round(sales.profit), sales.margin.toFixed(1), "100.0"],
      ]);
    } else if (active === "purchasing") {
      downloadCsv(`etera-purchasing-${fileRange}.csv`, [
        ["Supplier", "Spend (Rp)", "Share (%)", ...(purchPrev ? ["Previous period (Rp)"] : [])],
        ...purch.rows.map((r) => [r.s.name, Math.round(r.spend), r.share.toFixed(1), ...(purchPrev ? [Math.round(purchPrev.rows.find((x) => x.s.id === r.s.id)?.spend ?? 0)] : [])]),
        ["Total", Math.round(purch.total), "100.0", ...(purchPrev ? [Math.round(purchPrev.total)] : [])],
      ]);
    } else {
      downloadCsv(`etera-inventory-${data.today}.csv`, [
        ["Product", "SKU", "Category", "Stock", "Minimum", "Status", ...(canCost ? ["Unit cost (Rp)", "Stock value (Rp)"] : [])],
        ...data.products.map((p) => [p.name, p.sku, p.category, p.stock, p.min, stockState(p) === "out" ? "Out of stock" : stockState(p) === "low" ? "Below minimum" : "OK", ...(canCost ? [p.cost, p.stock * p.cost] : [])]),
      ]);
    }
    setToast("CSV file downloaded");
  }

  /* ---------- tanpa akses ---------- */
  if (!canView || tabs.length === 0) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <Reveal variant="scale">
          <div className="rounded-[28px] border border-[#1f1218]/10 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ff9d66]/25">
              <Icon name="shield" className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-black tracking-tight">No access to Reports</h1>
            <p className="mt-2 text-[#5d4a52]">The {roleInfo[role].label} role can’t open any report. Ask an Owner or Admin if you need access.</p>
            <Link href="/dashboard/main" className={`${btnPrimary} mt-6`}>
              Back to dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const showPeriod = active !== "inventory";
  const kpis: { icon: IconName; label: string; value: string; note: string }[] =
    active === "sales"
      ? [
          { icon: "sales", label: "Revenue", value: idr(sales.revenue), note: note(sales.revenue, salesPrev?.revenue ?? null) },
          { icon: "reports", label: "Gross margin", value: pct(sales.margin), note: `${marginNote}` },
          { icon: "cart", label: "Orders", value: num(sales.orders), note: note(sales.orders, salesPrev?.orders ?? null) },
          { icon: "finance", label: "Average order value", value: idr(sales.avgOrder), note: note(sales.avgOrder, salesPrev?.avgOrder ?? null) },
        ]
      : active === "purchasing"
        ? [
            { icon: "cart", label: "Total purchases", value: idr(purch.total), note: note(purch.total, purchPrev?.total ?? null) },
            { icon: "finance", label: "Average per month", value: idr(purch.total / idx.length), note: range },
            { icon: "building", label: "Active suppliers", value: `${purch.active} of ${data.suppliers.length}`, note: "Suppliers ordered from" },
            { icon: "alert", label: "Largest supplier", value: pct(purch.rows[0]?.share ?? 0, 0), note: purch.rows[0]?.s.name ?? "—" },
          ]
        : [
            ...(canCost ? [{ icon: "finance" as IconName, label: "Stock value", value: idr(stock.value), note: "At purchase cost" }] : []),
            { icon: "inventory", label: "Units in stock", value: num(stock.units), note: `${data.products.length} products` },
            { icon: "alert", label: "Below minimum", value: String(stock.low.length), note: "Need restocking" },
            { icon: "clock", label: "Out of stock", value: String(stock.out.length), note: stock.out.length > 0 ? stock.out.map((p) => p.name).slice(0, 2).join(", ") + (stock.out.length > 2 ? "…" : "") : "None" },
          ];
  const kpiCols = kpis.length === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4";

  return (
    <div className="mx-auto grid max-w-[1320px] gap-5">
      {/* judul + aksi */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Reports</h1>
            <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
            <p className="mt-3 max-w-xl text-[#5d4a52]">See how sales, purchasing, and stock are doing, and download the numbers.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {showPeriod && (
              <Select label="Period" value={period} onChange={(v) => (setPeriod(v as Period), setPage(1))}>
                {(Object.keys(periodLabel) as Period[]).map((p) => (
                  <option key={p} value={p}>
                    {periodLabel[p]}
                  </option>
                ))}
              </Select>
            )}
            <button type="button" onClick={exportCsv} className={btnGhost}>
              <Icon name="arrow" className="h-4 w-4 rotate-90" />
              Export CSV
            </button>
          </div>
        </div>
      </Reveal>

      {/* tab */}
      {tabs.length > 1 && (
        <Reveal delay={80}>
          <div role="tablist" aria-label="Reports" className="inline-flex flex-wrap gap-1 rounded-full bg-[#1f1218]/[0.06] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active === t.id}
                onClick={() => (setTab(t.id), setPage(1))}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${active === t.id ? "bg-[#1f1218] text-white" : "text-[#5d4a52] hover:text-[#1f1218]"}`}
              >
                <Icon name={t.icon} className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* KPI */}
      <div key={active} className={`grid gap-4 sm:grid-cols-2 ${kpiCols}`}>
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={100 + i * 60} className="h-full">
            <Kpi {...k} />
          </Reveal>
        ))}
      </div>

      {/* ===== PENJUALAN ===== */}
      {active === "sales" && (
        <>
          <Reveal delay={200}>
            <section className={card}>
              <h2 className="text-lg font-black">Revenue and cost of goods by month</h2>
              <p className="mb-5 mt-1 text-sm text-[#5d4a52]">Highlighted months are in the selected period. {monthShort(data.months[data.months.length - 1]!)} is month to date.</p>
              <MonthlyBars
                labels={labels}
                active={idx}
                ariaLabel="Revenue and cost of goods for each month"
                series={[
                  { name: "Revenue", color: "#ff9d66", values: salesSeries.map((s) => s.revenue) },
                  { name: "Cost of goods", color: "#1f1218", values: salesSeries.map((s) => s.cost) },
                ]}
              />
            </section>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-2">
            <Reveal delay={250} className="h-full">
              <section className={`${card} h-full`}>
                <h2 className="mb-5 text-lg font-black">Revenue by category</h2>
                <BarList dark={1} items={sales.byCategory.map((c) => ({ label: c.label, sub: pct(sales.revenue > 0 ? (c.value / sales.revenue) * 100 : 0, 0), value: c.value, text: idr(c.value) }))} />
              </section>
            </Reveal>
            <Reveal delay={300} className="h-full">
              <section className={`${card} h-full`}>
                <h2 className="mb-5 text-lg font-black">Top customers</h2>
                <BarList dark={1} items={customers} />
              </section>
            </Reveal>
          </div>

          <Reveal delay={350}>
            <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <div>
                  <h2 className="text-lg font-black">Product performance</h2>
                  <p className="text-sm text-[#5d4a52]">{range}</p>
                </div>
                <Select label="Sort by" value={sort} onChange={(v) => (setSort(v as Sort), setPage(1))}>
                  <option value="revenue">Sort: Revenue</option>
                  <option value="units">Sort: Units sold</option>
                  <option value="margin">Sort: Margin</option>
                </Select>
              </div>
              <div className="overflow-x-auto border-t border-[#1f1218]/10">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className={th}>
                      <th className="py-3 pl-5 pr-3">Product</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3 text-right">Units</th>
                      <th className="px-3 py-3 text-right">Revenue</th>
                      <th className="px-3 py-3 text-right">Gross profit</th>
                      <th className="px-3 py-3 text-right">Margin</th>
                      <th className="py-3 pl-3 pr-5 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={r.p.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <b className="block">{r.p.name}</b>
                          <span className="text-xs text-[#5d4a52]">{r.p.sku}</span>
                        </td>
                        <td className="px-3 py-3">
                          <Chip tone="soft">{r.p.category}</Chip>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{num(r.units)}</td>
                        <td className="px-3 py-3 text-right font-bold tabular-nums">{idr(r.revenue)}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{idr(r.profit)}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{pct(r.margin)}</td>
                        <td className="py-3 pl-3 pr-5 text-right tabular-nums">{pct(r.share)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sortedRows.length === 0 && <Empty title="No sales in this period" text="Pick a longer period." />}
              </div>
              <Pager page={page} size={data.pageSize} total={sortedRows.length} onPage={setPage} />
            </section>
          </Reveal>
        </>
      )}

      {/* ===== PEMBELIAN ===== */}
      {active === "purchasing" && (
        <>
          <Reveal delay={200}>
            <section className={card}>
              <h2 className="text-lg font-black">Purchases by month</h2>
              <p className="mb-5 mt-1 text-sm text-[#5d4a52]">Orders placed with suppliers, including VAT. Highlighted months are in the selected period.</p>
              <MonthlyBars labels={labels} active={idx} ariaLabel="Purchases for each month" series={[{ name: "Purchases", color: "#1f1218", values: purchSeries }]} />
            </section>
          </Reveal>

          <Reveal delay={250}>
            <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
              <div className="p-4 sm:p-5">
                <h2 className="text-lg font-black">Spend by supplier</h2>
                <p className="text-sm text-[#5d4a52]">{range}</p>
              </div>
              <div className="overflow-x-auto border-t border-[#1f1218]/10">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className={th}>
                      <th className="py-3 pl-5 pr-3">Supplier</th>
                      <th className="px-3 py-3 text-right">Spend</th>
                      <th className="px-3 py-3">Share</th>
                      <th className="py-3 pl-3 pr-5 text-right">{vs ? `Change ${vs}` : "Change"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purch.rows.map((r) => {
                      const before = purchPrev?.rows.find((x) => x.s.id === r.s.id)?.spend ?? null;
                      const d = delta(r.spend, before, vs);
                      return (
                        <tr key={r.s.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                          <td className="py-3 pl-5 pr-3 font-semibold">{r.s.name}</td>
                          <td className="px-3 py-3 text-right font-bold tabular-nums">{idr(r.spend)}</td>
                          <td className="px-3 py-3">
                            <span className="flex items-center gap-3">
                              <span className="h-2 w-32 overflow-hidden rounded-full bg-[#1f1218]/10">
                                <span className="block h-full rounded-full bg-[#ff9d66]" style={{ width: `${r.share}%` }} />
                              </span>
                              <span className="tabular-nums">{pct(r.share)}</span>
                            </span>
                          </td>
                          <td className={`py-3 pl-3 pr-5 text-right tabular-nums ${d && d.pct > 0 ? "font-semibold" : ""}`}>{d ? `${d.pct >= 0 ? "+" : "−"}${Math.abs(d.pct).toFixed(1).replace(".", ",")}%` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#1f1218]/20 bg-[#1f1218]/[0.04] font-black">
                      <td className="py-3 pl-5 pr-3">Total</td>
                      <td className="px-3 py-3 text-right tabular-nums">{idr(purch.total)}</td>
                      <td className="px-3 py-3 tabular-nums">100%</td>
                      <td className="py-3 pl-3 pr-5 text-right tabular-nums">{purchPrev ? deltaText(delta(purch.total, purchPrev.total, ""), "—").trim() : "—"}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </Reveal>
        </>
      )}

      {/* ===== INVENTORY ===== */}
      {active === "inventory" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Reveal delay={200} className="h-full">
            <section className={`${card} h-full`}>
              <h2 className="mb-5 text-lg font-black">{canCost ? "Stock value by category" : "Units in stock by category"}</h2>
              <BarList
                dark={1}
                items={stock.byCategory
                  .sort((a, b) => (canCost ? b.value - a.value : b.units - a.units))
                  .map((c) => ({ label: c.label, value: canCost ? c.value : c.units, text: canCost ? idr(c.value) : `${num(c.units)} units` }))}
              />
            </section>
          </Reveal>

          <Reveal delay={250} className="h-full">
            <section className="h-full rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <div>
                  <h2 className="text-lg font-black">Reorder list</h2>
                  <p className="text-sm text-[#5d4a52]">Products at or below their minimum stock, most urgent first.</p>
                </div>
                {can("purchasing:create") && (
                  <Link href="/dashboard/purchasing" className={btnGhost}>
                    <Icon name="cart" className="h-4 w-4" />
                    Create purchase order
                  </Link>
                )}
              </div>
              <div className="overflow-x-auto border-t border-[#1f1218]/10">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className={th}>
                      <th className="py-3 pl-5 pr-3">Product</th>
                      <th className="px-3 py-3 text-right">Stock</th>
                      <th className="px-3 py-3 text-right">Minimum</th>
                      <th className={`px-3 py-3 text-right ${canCost ? "" : "pr-5"}`}>Suggested order</th>
                      {canCost && <th className="py-3 pl-3 pr-5 text-right">Estimated cost</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {stock.reorder.map((p) => (
                      <tr key={p.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <b className="block">{p.name}</b>
                          <span className="text-xs text-[#5d4a52]">{p.sku}</span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="inline-flex items-center gap-2">
                            {p.stock <= 0 && <Chip tone="red">Out</Chip>}
                            <b className="tabular-nums">{p.stock}</b>
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{p.min}</td>
                        <td className={`px-3 py-3 text-right font-bold tabular-nums ${canCost ? "" : "pr-5"}`}>
                          {reorderQty(p)} {p.unit}
                        </td>
                        {canCost && <td className="py-3 pl-3 pr-5 text-right tabular-nums">{idr(reorderQty(p) * p.cost)}</td>}
                      </tr>
                    ))}
                  </tbody>
                  {canCost && stock.reorder.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-[#1f1218]/20 bg-[#1f1218]/[0.04] font-black">
                        <td className="py-3 pl-5 pr-3" colSpan={4}>
                          Total · {stock.reorder.length} products
                        </td>
                        <td className="py-3 pl-3 pr-5 text-right tabular-nums">{idr(stock.reorder.reduce((s, p) => s + reorderQty(p) * p.cost, 0))}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
                {stock.reorder.length === 0 && <Empty title="Nothing to reorder" text="Every product is above its minimum stock." />}
              </div>
            </section>
          </Reveal>
        </div>
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
