"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useApp } from "@/components/dashboard/app-context";
import Chip, { type ChipTone } from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnGhost, btnPrimary } from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import AdjustModal, { type AdjustPayload } from "./AdjustModal";
import { idr, statusMeta, statusOf, totalStock, type StockStatus } from "./helpers";
import ProductModal from "./ProductModal";
import type { InventoryData, Movement, MovementType, Product } from "./types";

type Tab = "products" | "movements" | "warehouses";
type StatusFilter = "all" | StockStatus;

const moveMeta: Record<MovementType, { label: string; tone: ChipTone }> = {
  in: { label: "Stock in", tone: "orange" },
  out: { label: "Stock out", tone: "brown" },
  adjust: { label: "Count", tone: "soft" },
};

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

export default function InventoryView({ data }: { data: InventoryData }) {
  const { user, can, roleInfo, role } = useApp();

  const [products, setProducts] = useState<Product[]>(data.products);
  const [movements, setMovements] = useState<Movement[]>(data.movements);
  const [tab, setTab] = useState<Tab>("products");

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [wh, setWh] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<"name" | "stock" | "price">("name");
  const [page, setPage] = useState(1);
  const [moveFilter, setMoveFilter] = useState<"all" | MovementType>("all");

  const [productModal, setProductModal] = useState<{ open: boolean; product?: Product }>({ open: false });
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; productId?: string }>({ open: false });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const canView = can("inventory:view");
  const canManage = can("inventory:manage");
  const canAdjust = can("inventory:adjust");
  const canCost = can("inventory:cost");

  const qtyOf = (p: Product) => (wh === "all" ? totalStock(p) : (p.stock[wh] ?? 0));
  const whName = (id: string) => data.warehouses.find((w) => w.id === id)?.name ?? id;
  const active = useMemo(() => products.filter((p) => p.active), [products]);

  // filter dasar (cari + kategori), dipakai juga untuk hitungan status
  const base = useMemo(() => {
    const term = q.trim().toLowerCase();
    return active.filter(
      (p) =>
        (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) && (cat === "all" || p.category === cat),
    );
  }, [active, q, cat]);

  const counts = useMemo(() => {
    const c = { all: base.length, in: 0, low: 0, out: 0 };
    base.forEach((p) => {
      c[statusOf(wh === "all" ? totalStock(p) : (p.stock[wh] ?? 0), p.min)]++;
    });
    return c;
  }, [base, wh]);

  const rows = useMemo(() => {
    const list = base.filter((p) => status === "all" || statusOf(wh === "all" ? totalStock(p) : (p.stock[wh] ?? 0), p.min) === status);
    const qty = (p: Product) => (wh === "all" ? totalStock(p) : (p.stock[wh] ?? 0));
    return [...list].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : sort === "stock" ? qty(a) - qty(b) : b.price - a.price));
  }, [base, status, wh, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / data.pageSize));
  const current = Math.min(page, pages);
  const pageRows = rows.slice((current - 1) * data.pageSize, current * data.pageSize);

  // KPI (seluruh gudang)
  const lowCount = active.filter((p) => statusOf(totalStock(p), p.min) === "low").length;
  const outCount = active.filter((p) => statusOf(totalStock(p), p.min) === "out").length;
  const stockValue = active.reduce((sum, p) => sum + p.cost * totalStock(p), 0);
  const totalUnits = active.reduce((sum, p) => sum + totalStock(p), 0);

  /* ---------- aksi ---------- */
  function saveProduct(p: Product, opening: number) {
    const exists = products.some((x) => x.id === p.id);
    if (exists) {
      setProducts(products.map((x) => (x.id === p.id ? p : x)));
      setToast(`${p.name} updated`);
    } else {
      const main = data.warehouses[0]?.id;
      const withStock: Product = { ...p, stock: main ? { [main]: opening } : {} };
      setProducts([withStock, ...products]);
      if (opening > 0 && main) {
        setMovements([
          { id: `m${Date.now()}`, date: now(), productId: p.id, product: p.name, type: "in", qty: opening, warehouseId: main, ref: "Opening stock", by: user.name },
          ...movements,
        ]);
      }
      setToast(`${p.name} added`);
    }
    setProductModal({ open: false });
  }

  function adjust(a: AdjustPayload) {
    const p = products.find((x) => x.id === a.productId);
    if (!p) return;
    const before = p.stock[a.warehouseId] ?? 0;
    const after = a.type === "in" ? before + a.qty : a.type === "out" ? before - a.qty : a.qty;
    setProducts(products.map((x) => (x.id === p.id ? { ...x, stock: { ...x.stock, [a.warehouseId]: after } } : x)));
    setMovements([
      {
        id: `m${Date.now()}`,
        date: now(),
        productId: p.id,
        product: p.name,
        type: a.type,
        qty: after - before,
        warehouseId: a.warehouseId,
        ref: a.note || (a.type === "adjust" ? "Stock count" : "Manual entry"),
        by: user.name,
      },
      ...movements,
    ]);
    setAdjustModal({ open: false });
    setToast(`Stock updated for ${p.name}`);
  }

  function clearFilters() {
    setQ("");
    setCat("all");
    setStatus("all");
    setWh("all");
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
            <h1 className="mt-5 text-2xl font-black tracking-tight">No access to Inventory</h1>
            <p className="mt-2 text-[#5d4a52]">
              The {roleInfo[role].label} role can’t open this page. Ask an Owner or Admin if you need access.
            </p>
            <Link href="/dashboard" className={`${btnPrimary} mt-6`}>
              Back to dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "products", label: "Products" },
    { id: "movements", label: "Stock movements" },
    { id: "warehouses", label: "Warehouses" },
  ];

  const shownMoves = movements.filter((m) => moveFilter === "all" || m.type === moveFilter);

  return (
    <div className="mx-auto grid max-w-[1320px] gap-5">
      {/* judul + aksi */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Inventory</h1>
            <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
            <p className="mt-3 max-w-xl text-[#5d4a52]">Track products, stock levels, and every movement across your warehouses.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canAdjust && (
              <button type="button" onClick={() => setAdjustModal({ open: true })} className={btnGhost}>
                <Icon name="inventory" className="h-4 w-4" />
                Adjust stock
              </button>
            )}
            {canManage && (
              <button type="button" onClick={() => setProductModal({ open: true })} className={btnPrimary}>
                <Icon name="plus" className="h-4 w-4" />
                Add product
              </button>
            )}
            {!canAdjust && !canManage && <Chip tone="soft">View only</Chip>}
          </div>
        </div>
      </Reveal>

      {/* KPI */}
      <div className={`grid gap-4 sm:grid-cols-2 ${canCost ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
        <Reveal delay={60} className="h-full">
          <Kpi icon="inventory" label="Active products" value={String(active.length)} note={`${totalUnits.toLocaleString("id-ID")} units in stock`} />
        </Reveal>
        {canCost && (
          <Reveal delay={120} className="h-full">
            <Kpi icon="finance" label="Stock value (at cost)" value={idr(stockValue)} note="All warehouses" />
          </Reveal>
        )}
        <Reveal delay={180} className="h-full">
          <Kpi icon="alert" label="Low stock" value={String(lowCount)} note="At or below minimum" />
        </Reveal>
        <Reveal delay={240} className="h-full">
          <Kpi icon="close" label="Out of stock" value={String(outCount)} note="Needs restocking" />
        </Reveal>
      </div>

      {/* tab */}
      <Reveal delay={150}>
        <div role="tablist" aria-label="Inventory sections" className="inline-flex flex-wrap gap-1 rounded-full bg-[#1f1218]/[0.06] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${
                tab === t.id ? "bg-[#1f1218] text-white" : "text-[#5d4a52] hover:text-[#1f1218]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* ===== PRODUK ===== */}
      {tab === "products" && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <label className="group relative w-full sm:w-72">
                <span className="sr-only">Search products</span>
                <Icon
                  name="search"
                  className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5d4a52] transition-colors group-focus-within:text-[#e8641f]"
                />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name or SKU…"
                  className="h-10 w-full rounded-full border border-[#1f1218]/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#5d4a52]/60 focus:border-[#ff9d66] focus:ring-4 focus:ring-[#ff9d66]/25"
                />
              </label>
              <Select label="Category" value={cat} onChange={(v) => (setCat(v), setPage(1))}>
                <option value="all">All categories</option>
                {data.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Select label="Warehouse" value={wh} onChange={(v) => (setWh(v), setPage(1))}>
                <option value="all">All warehouses</option>
                {data.warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </Select>
              <div className="sm:ml-auto">
                <Select label="Sort by" value={sort} onChange={(v) => setSort(v as typeof sort)}>
                  <option value="name">Sort: Name</option>
                  <option value="stock">Sort: Lowest stock</option>
                  <option value="price">Sort: Highest price</option>
                </Select>
              </div>
            </div>

            {/* filter status */}
            <div className="flex flex-wrap gap-2 border-t border-[#1f1218]/10 px-4 py-3 sm:px-5">
              {(
                [
                  ["all", "All"],
                  ["in", "In stock"],
                  ["low", "Low stock"],
                  ["out", "Out of stock"],
                ] as [StatusFilter, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={status === id}
                  onClick={() => (setStatus(id), setPage(1))}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
                    status === id ? "bg-[#1f1218] text-white" : "bg-[#1f1218]/[0.06] text-[#1f1218] hover:bg-[#ff9d66]/30"
                  }`}
                >
                  {label}
                  <span className={`rounded-full px-1.5 text-[11px] ${status === id ? "bg-white/20" : "bg-white"}`}>{counts[id]}</span>
                </button>
              ))}
            </div>

            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Product</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Status</th>
                    {canCost && <th className="px-3 py-3 text-right">Cost</th>}
                    <th className="px-3 py-3 text-right">Price</th>
                    <th className="py-3 pl-3 pr-5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((p) => {
                    const qty = qtyOf(p);
                    const st = statusOf(wh === "all" ? qty : totalStock(p) > 0 ? qty : 0, p.min);
                    const stForRow = wh === "all" ? statusOf(qty, p.min) : statusOf(qty, Math.ceil(p.min / data.warehouses.length));
                    void st;
                    const meta = statusMeta[stForRow];
                    const barMax = wh === "all" ? Math.max(p.min * 2, 1) : Math.max(Math.ceil(p.min / data.warehouses.length) * 2, 1);
                    return (
                      <tr key={p.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                        <td className="py-3 pl-5 pr-3">
                          <b className="block">{p.name}</b>
                          <span className="text-xs text-[#5d4a52]">{p.sku}</span>
                        </td>
                        <td className="px-3 py-3">{p.category}</td>
                        <td className="px-3 py-3">
                          <b className="font-black">{qty.toLocaleString("id-ID")}</b> <span className="text-xs text-[#5d4a52]">{p.unit}</span>
                          <div className="mt-1.5 h-1.5 w-28 rounded-full bg-[#1f1218]/[0.08]">
                            <div
                              className={`h-full rounded-full transition-[width] duration-500 ${stForRow === "low" ? "bg-[#c8362b]" : "bg-[#ff9d66]"}`}
                              style={{ width: `${Math.min(100, (qty / barMax) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Chip tone={meta.tone}>{meta.label}</Chip>
                        </td>
                        {canCost && <td className="px-3 py-3 text-right tabular-nums">{idr(p.cost)}</td>}
                        <td className="px-3 py-3 text-right font-bold tabular-nums">{idr(p.price)}</td>
                        <td className="py-3 pl-3 pr-5">
                          <div className="flex justify-end gap-2">
                            {canAdjust && (
                              <button
                                type="button"
                                onClick={() => setAdjustModal({ open: true, productId: p.id })}
                                className="rounded-full border border-[#1f1218]/15 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 hover:bg-[#ff9d66]/30"
                              >
                                Adjust
                              </button>
                            )}
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => setProductModal({ open: true, product: p })}
                                aria-label={`Edit ${p.name}`}
                                className="grid h-8 w-8 place-items-center rounded-full border border-[#1f1218]/15 transition-colors duration-200 hover:bg-[#ff9d66]/30"
                              >
                                <Icon name="edit" className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {rows.length === 0 && (
                <div className="px-5 py-14 text-center">
                  <p className="font-black">No products found</p>
                  <p className="mt-1 text-sm text-[#5d4a52]">Try a different search or clear the filters.</p>
                  <button type="button" onClick={clearFilters} className={`${btnGhost} mt-4`}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {rows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1f1218]/10 px-4 py-3 text-sm sm:px-5">
                <p className="text-[#5d4a52]">
                  Showing {(current - 1) * data.pageSize + 1}–{Math.min(current * data.pageSize, rows.length)} of {rows.length}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage(current - 1)}
                    disabled={current === 1}
                    aria-label="Previous page"
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#1f1218]/15 transition-colors duration-200 hover:bg-[#ff9d66]/30 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Icon name="arrow" className="h-4 w-4 rotate-180" />
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      aria-current={n === current ? "page" : undefined}
                      className={`h-9 min-w-9 rounded-full px-3 text-xs font-bold transition-colors duration-200 ${
                        n === current ? "bg-[#1f1218] text-white" : "hover:bg-[#ff9d66]/30"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage(current + 1)}
                    disabled={current === pages}
                    aria-label="Next page"
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#1f1218]/15 transition-colors duration-200 hover:bg-[#ff9d66]/30 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Icon name="arrow" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </Reveal>
      )}

      {/* ===== PERGERAKAN STOK ===== */}
      {tab === "movements" && (
        <Reveal delay={150}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            <div className="flex flex-wrap gap-2 p-4 sm:p-5">
              {(
                [
                  ["all", "All"],
                  ["in", "Stock in"],
                  ["out", "Stock out"],
                  ["adjust", "Count"],
                ] as ["all" | MovementType, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={moveFilter === id}
                  onClick={() => setMoveFilter(id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
                    moveFilter === id ? "bg-[#1f1218] text-white" : "bg-[#1f1218]/[0.06] hover:bg-[#ff9d66]/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto border-t border-[#1f1218]/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">Date</th>
                    <th className="px-3 py-3">Product</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3">Warehouse</th>
                    <th className="px-3 py-3">Reference</th>
                    <th className="py-3 pl-3 pr-5">By</th>
                  </tr>
                </thead>
                <tbody>
                  {shownMoves.map((m) => (
                    <tr key={m.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                      <td className="whitespace-nowrap py-3 pl-5 pr-3 text-[#5d4a52]">{m.date}</td>
                      <td className="px-3 py-3 font-bold">{m.product}</td>
                      <td className="px-3 py-3">
                        <Chip tone={moveMeta[m.type].tone}>{moveMeta[m.type].label}</Chip>
                      </td>
                      <td className={`px-3 py-3 text-right font-black tabular-nums ${m.qty < 0 ? "text-[#9f2a20]" : ""}`}>
                        {m.qty > 0 ? `+${m.qty}` : m.qty}
                      </td>
                      <td className="px-3 py-3">{whName(m.warehouseId)}</td>
                      <td className="px-3 py-3 text-[#5d4a52]">{m.ref}</td>
                      <td className="py-3 pl-3 pr-5">{m.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {shownMoves.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#5d4a52]">No movements yet.</p>}
            </div>
          </section>
        </Reveal>
      )}

      {/* ===== GUDANG ===== */}
      {tab === "warehouses" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.warehouses.map((w, i) => {
            const units = active.reduce((s, p) => s + (p.stock[w.id] ?? 0), 0);
            const items = active.filter((p) => (p.stock[w.id] ?? 0) > 0).length;
            const empty = active.length - items;
            const value = active.reduce((s, p) => s + p.cost * (p.stock[w.id] ?? 0), 0);
            return (
              <Reveal key={w.id} delay={100 + i * 90} className="h-full">
                <article className="group h-full rounded-[24px] border border-[#1f1218]/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9d66] hover:shadow-[0_18px_40px_-22px_rgba(255,157,102,.9)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ff9d66]/25 transition-colors duration-300 group-hover:bg-[#ff9d66]">
                        <Icon name="building" className="h-5 w-5" />
                      </span>
                      <div className="leading-tight">
                        <h3 className="font-black">{w.name}</h3>
                        <p className="text-xs text-[#5d4a52]">{w.city}</p>
                      </div>
                    </div>
                    {i === 0 && <Chip tone="brown">Default</Chip>}
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs font-semibold text-[#5d4a52]">Units on hand</dt>
                      <dd className="text-xl font-black">{units.toLocaleString("id-ID")}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold text-[#5d4a52]">Products stocked</dt>
                      <dd className="text-xl font-black">
                        {items}
                        <span className="text-sm font-bold text-[#5d4a52]"> / {active.length}</span>
                      </dd>
                    </div>
                    {canCost && (
                      <div className="col-span-2">
                        <dt className="text-xs font-semibold text-[#5d4a52]">Stock value (at cost)</dt>
                        <dd className="text-lg font-black">{idr(value)}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-bold">
                      <span>Coverage</span>
                      <span>{active.length ? Math.round((items / active.length) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1f1218]/[0.08]">
                      <div className="h-full rounded-full bg-[#ff9d66] transition-[width] duration-700" style={{ width: `${active.length ? (items / active.length) * 100 : 0}%` }} />
                    </div>
                    {empty > 0 && <p className="mt-2 text-xs text-[#5d4a52]">{empty} products have no stock here.</p>}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* modal */}
      {productModal.open && (
        <ProductModal
          key={productModal.product?.id ?? "new"}
          product={productModal.product}
          categories={data.categories}
          units={data.units}
          existingSkus={products.filter((p) => p.id !== productModal.product?.id).map((p) => p.sku)}
          onClose={() => setProductModal({ open: false })}
          onSave={saveProduct}
        />
      )}
      {adjustModal.open && (
        <AdjustModal
          products={active}
          warehouses={data.warehouses}
          initialProductId={adjustModal.productId}
          onClose={() => setAdjustModal({ open: false })}
          onSubmit={adjust}
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

function now() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
