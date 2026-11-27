"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/dashboard/app-context";
import Chip from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { btnGhost, btnPrimary } from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import { Empty, Kpi, Pager, SearchBox, Select } from "@/components/purchasing/parts";
import { accountTypeLabel, agingBuckets, balanceOf, bucketIndex, calcDoc, fmtDate, idr, statusMeta } from "./helpers";
import PaymentModal, { type PaymentPayload } from "./PaymentModal";
import TransactionModal, { type TxnPayload } from "./TransactionModal";
import type { DocCalc, DocKind, DocStatus, FinanceData, Txn } from "./types";

type Tab = "invoice" | "bill" | "cash";
type DocFilter = "all" | DocStatus | "overdue";
type FlowFilter = "all" | "in" | "out";

export default function FinanceView({ data }: { data: FinanceData }) {
  const { user, can, role, roleInfo } = useApp();

  const [txns, setTxns] = useState<Txn[]>(data.txns);
  const [tab, setTab] = useState<Tab | null>(null);

  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<DocFilter>("all");
  const [page, setPage] = useState(1);
  const [cq, setCq] = useState("");
  const [accountF, setAccountF] = useState("all");
  const [flowF, setFlowF] = useState<FlowFilter>("all");
  const [cpage, setCpage] = useState(1);

  const [payModal, setPayModal] = useState<{ kind: DocKind; docId?: string } | null>(null);
  const [txnModal, setTxnModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const canView = can("finance:view");
  const canDocs = can("finance:receivables"); // invoice dan bill
  const canCash = can("finance:cashflow"); // kas, bank, dan transaksi

  const tabs: { id: Tab; label: string }[] = [
    ...(canDocs ? [{ id: "invoice" as Tab, label: "Invoices" }, { id: "bill" as Tab, label: "Bills" }] : []),
    ...(canCash ? [{ id: "cash" as Tab, label: "Cash & bank" }] : []),
  ];
  const active: Tab | undefined = tab && tabs.some((t) => t.id === tab) ? tab : tabs[0]?.id;

  const calcs = useMemo<DocCalc[]>(() => data.docs.map((d) => calcDoc(d, txns, data.today)), [data.docs, txns, data.today]);
  const invoices = calcs.filter((c) => c.doc.kind === "invoice");
  const bills = calcs.filter((c) => c.doc.kind === "bill");
  const sum = (list: DocCalc[]) => list.reduce((s, c) => s + c.balance, 0);

  /* ---------- KPI ---------- */
  const cashTotal = data.accounts.reduce((s, a) => s + balanceOf(a, txns), 0);
  const overdueInv = invoices.filter((c) => c.overdue);
  const month = data.today.slice(0, 7);
  const monthLabel = new Date(`${data.today}T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const monthTxns = txns.filter((t) => t.date.startsWith(month));
  const monthIn = monthTxns.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const monthOut = monthTxns.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);

  const kpis: { icon: IconName; label: string; value: string; note: string }[] = [
    ...(canCash ? [{ icon: "finance" as IconName, label: "Cash & bank", value: idr(cashTotal), note: `${data.accounts.length} accounts` }] : []),
    ...(canDocs
      ? [
          { icon: "sales" as IconName, label: "Receivables", value: idr(sum(invoices)), note: `${invoices.filter((c) => c.balance > 0).length} open invoices` },
          { icon: "cart" as IconName, label: "Payables", value: idr(sum(bills)), note: `${bills.filter((c) => c.balance > 0).length} open bills` },
          { icon: "alert" as IconName, label: "Overdue receivables", value: idr(sum(overdueInv)), note: `${overdueInv.length} invoice${overdueInv.length === 1 ? "" : "s"} past due date` },
        ]
      : []),
  ];
  const kpiCols: Record<number, string> = { 1: "xl:grid-cols-1", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4" };

  /* ---------- invoice / bill ---------- */
  const kind: DocKind = active === "bill" ? "bill" : "invoice";
  const list = kind === "invoice" ? invoices : bills;

  const searched = useMemo(() => {
    const t = q.trim().toLowerCase();
    return list.filter((c) => !t || c.doc.number.toLowerCase().includes(t) || c.doc.party.toLowerCase().includes(t) || (c.doc.ref ?? "").toLowerCase().includes(t));
  }, [list, q]);

  const counts = useMemo(() => {
    const c: Record<DocFilter, number> = { all: searched.length, unpaid: 0, partial: 0, paid: 0, overdue: 0 };
    searched.forEach((x) => {
      c[x.status]++;
      if (x.overdue) c.overdue++;
    });
    return c;
  }, [searched]);

  const rows = useMemo(() => {
    const filtered = searched.filter((c) => statusF === "all" || (statusF === "overdue" ? c.overdue : c.status === statusF));
    // yang masih punya sisa dulu, paling terlambat di atas; lunas di bawah
    return [...filtered].sort((a, b) => Number(b.balance > 0) - Number(a.balance > 0) || b.daysLate - a.daysLate || a.doc.dueDate.localeCompare(b.doc.dueDate));
  }, [searched, statusF]);
  const fCurrent = Math.min(page, Math.max(1, Math.ceil(rows.length / data.pageSize)));
  const pageRows = rows.slice((fCurrent - 1) * data.pageSize, fCurrent * data.pageSize);

  const aging = agingBuckets.map((label, i) => {
    const inB = list.filter((c) => c.balance > 0 && bucketIndex(c) === i);
    return { label, value: inB.reduce((s, c) => s + c.balance, 0), count: inB.length };
  });

  /* ---------- kas & bank ---------- */
  const accountName = (id: string) => data.accounts.find((a) => a.id === id)?.name ?? id;
  const docOf = (id?: string) => (id ? data.docs.find((d) => d.id === id) : undefined);
  const txnRows = useMemo(() => {
    const t = cq.trim().toLowerCase();
    return txns
      .filter((x) => (accountF === "all" || x.accountId === accountF) && (flowF === "all" || x.type === flowF))
      .filter((x) => !t || x.category.toLowerCase().includes(t) || x.note.toLowerCase().includes(t) || (docOf(x.docId)?.number ?? "").toLowerCase().includes(t))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txns, cq, accountF, flowF]);
  const cPages = Math.max(1, Math.ceil(txnRows.length / data.pageSize));
  const cCurrent = Math.min(cpage, cPages);
  const cPageRows = txnRows.slice((cCurrent - 1) * data.pageSize, cCurrent * data.pageSize);

  /* ---------- aksi ---------- */
  // Catatan produksi: simpan lewat API; saldo akun dihitung server dari transaksi.
  function recordPayment(p: PaymentPayload) {
    const doc = docOf(p.docId);
    if (!doc) return;
    const inflow = doc.kind === "invoice";
    const txn: Txn = {
      id: `t${Date.now()}`,
      date: p.date,
      accountId: p.accountId,
      type: inflow ? "in" : "out",
      amount: p.amount,
      category: inflow ? "Customer payment" : "Supplier payment",
      note: p.ref ? `${doc.number} · ${p.ref}` : doc.number,
      docId: doc.id,
      by: user.name,
    };
    setTxns([txn, ...txns]);
    setPayModal(null);
    setToast(`${idr(p.amount)} ${inflow ? "received for" : "paid on"} ${doc.number}`);
  }

  function addTxn(p: TxnPayload) {
    setTxns([{ id: `t${Date.now()}`, ...p, by: user.name }, ...txns]);
    setTxnModal(false);
    setCpage(1);
    setToast(`${p.type === "in" ? "Money in" : "Money out"} ${idr(p.amount)} saved`);
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
            <h1 className="mt-5 text-2xl font-black tracking-tight">No access to Finance</h1>
            <p className="mt-2 text-[#5d4a52]">The {roleInfo[role].label} role can’t open this page. Ask an Owner or Admin if you need access.</p>
            <Link href="/dashboard/main" className={`${btnPrimary} mt-6`}>
              Back to dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const docChips: [DocFilter, string][] = [["all", "All"], ["unpaid", "Unpaid"], ["partial", "Partial"], ["paid", "Paid"], ["overdue", "Overdue"]];
  const flowChips: [FlowFilter, string][] = [["all", "All"], ["in", "Money in"], ["out", "Money out"]];
  const flowCounts = { all: txnRows.length, in: txnRows.filter((x) => x.type === "in").length, out: txnRows.filter((x) => x.type === "out").length };
  const openDocs = list.filter((c) => c.balance > 0);
  const isInvoice = kind === "invoice";

  return (
    <div className="mx-auto grid max-w-[1320px] gap-5">
      {/* judul + aksi */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Finance</h1>
            <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
            <p className="mt-3 max-w-xl text-[#5d4a52]">Collect what customers owe, pay supplier bills on time, and see where your cash is.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canDocs && (active === "invoice" || active === "bill") && (
              <button type="button" onClick={() => setPayModal({ kind })} className={canCash ? btnGhost : btnPrimary}>
                <Icon name="check" className="h-4 w-4" />
                {isInvoice ? "Record payment" : "Pay a bill"}
              </button>
            )}
            {canCash && (
              <button type="button" onClick={() => setTxnModal(true)} className={btnPrimary}>
                <Icon name="plus" className="h-4 w-4" />
                New transaction
              </button>
            )}
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
          <div role="tablist" aria-label="Finance sections" className="inline-flex flex-wrap gap-1 rounded-full bg-[#1f1218]/[0.06] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active === t.id}
                onClick={() => (setTab(t.id), setStatusF("all"), setQ(""), setPage(1))}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${active === t.id ? "bg-[#1f1218] text-white" : "text-[#5d4a52] hover:text-[#1f1218]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* ===== INVOICE / BILL ===== */}
      {(active === "invoice" || active === "bill") && canDocs && (
        <Reveal delay={200}>
          <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
            {/* umur piutang / utang */}
            <div className="grid gap-px overflow-hidden rounded-t-[24px] border-b border-[#1f1218]/10 bg-[#1f1218]/10 sm:grid-cols-4">
              {aging.map((a, i) => (
                <div key={a.label} className="bg-white px-5 py-4">
                  <p className="text-xs font-semibold text-[#5d4a52]">{a.label}</p>
                  <p className={`mt-1 text-lg font-black tabular-nums ${i >= 2 && a.value > 0 ? "text-[#9f2a20]" : ""}`}>{idr(a.value)}</p>
                  <p className="text-xs text-[#5d4a52]">
                    {a.count} {isInvoice ? "invoice" : "bill"}
                    {a.count === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <SearchBox label={isInvoice ? "Search invoices" : "Search bills"} value={q} onChange={(v) => (setQ(v), setPage(1))} placeholder={isInvoice ? "Search invoice or customer…" : "Search bill, PO, or supplier…"} />
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[#1f1218]/10 px-4 py-3 sm:px-5">
              {docChips.map(([id, label]) => (
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
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                    <th className="py-3 pl-5 pr-3">{isInvoice ? "Invoice" : "Bill"}</th>
                    <th className="px-3 py-3">{isInvoice ? "Customer" : "Supplier"}</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Due</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-3 py-3 text-right">Balance</th>
                    <th className="py-3 pl-3 pr-5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((c) => (
                    <tr key={c.doc.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                      <td className="py-3 pl-5 pr-3">
                        <b className="block">{c.doc.number}</b>
                        <span className="text-xs text-[#5d4a52]">
                          {fmtDate(c.doc.date)}
                          {c.doc.ref ? ` · ${c.doc.ref}` : ""}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold">{c.doc.party}</td>
                      <td className="px-3 py-3">
                        <span className="flex flex-wrap gap-1.5">
                          <Chip tone={statusMeta[c.status].tone}>{statusMeta[c.status].label}</Chip>
                          {c.overdue && <Chip tone="red">Overdue</Chip>}
                        </span>
                        {c.payments > 0 && <span className="mt-1 block text-xs text-[#5d4a52]">{c.payments} payment{c.payments === 1 ? "" : "s"}</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="block">{fmtDate(c.doc.dueDate)}</span>
                        {c.overdue && <span className="text-xs font-semibold text-[#9f2a20]">{c.daysLate} day{c.daysLate === 1 ? "" : "s"} late</span>}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{idr(c.doc.total)}</td>
                      <td className={`px-3 py-3 text-right font-bold tabular-nums ${c.overdue ? "text-[#9f2a20]" : ""}`}>{idr(c.balance)}</td>
                      <td className="py-3 pl-3 pr-5">
                        <div className="flex justify-end">
                          {c.balance > 0 ? (
                            <button
                              type="button"
                              onClick={() => setPayModal({ kind, docId: c.doc.id })}
                              className="rounded-full border border-[#1f1218]/15 px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 hover:bg-[#ff9d66]/30"
                            >
                              {isInvoice ? "Record payment" : "Pay"}
                            </button>
                          ) : (
                            <span className="px-2 text-xs font-bold text-[#5d4a52]">Settled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <Empty title={isInvoice ? "No invoices found" : "No bills found"} text="Try a different search or filter." onClear={() => (setQ(""), setStatusF("all"), setPage(1))} />
              )}
            </div>
            <Pager page={page} size={data.pageSize} total={rows.length} onPage={setPage} />
          </section>
        </Reveal>
      )}

      {/* ===== KAS & BANK ===== */}
      {active === "cash" && canCash && (
        <>
          <Reveal delay={200}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {data.accounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={accountF === a.id}
                  onClick={() => (setAccountF(accountF === a.id ? "all" : a.id), setCpage(1))}
                  className={`rounded-[24px] border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 ${
                    accountF === a.id ? "border-[#1f1218] bg-[#1f1218] text-white" : "border-[#1f1218]/10 bg-white hover:border-[#ff9d66]"
                  }`}
                >
                  <span className={`text-xs font-semibold ${accountF === a.id ? "text-white/70" : "text-[#5d4a52]"}`}>{accountTypeLabel[a.type]}</span>
                  <span className="mt-1 block font-black">{a.name}</span>
                  <span className="mt-3 block text-xl font-black tabular-nums">{idr(balanceOf(a, txns))}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={250}>
            <section className="rounded-[24px] border border-[#1f1218]/10 bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                <SearchBox label="Search transactions" value={cq} onChange={(v) => (setCq(v), setCpage(1))} placeholder="Search category, note, or invoice…" />
                <Select label="Account" value={accountF} onChange={(v) => (setAccountF(v), setCpage(1))}>
                  <option value="all">All accounts</option>
                  {data.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-[#5d4a52] sm:ml-auto">
                  {monthLabel}: in <b className="text-[#1f1218]">{idr(monthIn)}</b> · out <b className="text-[#1f1218]">{idr(monthOut)}</b> · net{" "}
                  <b className={monthIn - monthOut < 0 ? "text-[#9f2a20]" : "text-[#1f1218]"}>{idr(monthIn - monthOut)}</b>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[#1f1218]/10 px-4 py-3 sm:px-5">
                {flowChips.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={flowF === id}
                    onClick={() => (setFlowF(id), setCpage(1))}
                    className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-200 ${
                      flowF === id ? "bg-[#1f1218] text-white" : "bg-[#1f1218]/[0.06] text-[#1f1218] hover:bg-[#ff9d66]/30"
                    }`}
                  >
                    {label}
                    <span className={`rounded-full px-1.5 text-[11px] ${flowF === id ? "bg-white/20" : "bg-white"}`}>{flowCounts[id]}</span>
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto border-t border-[#1f1218]/10">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                      <th className="py-3 pl-5 pr-3">Date</th>
                      <th className="px-3 py-3">Description</th>
                      <th className="px-3 py-3">Account</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="py-3 pl-3 pr-5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cPageRows.map((t) => {
                      const doc = docOf(t.docId);
                      return (
                        <tr key={t.id} className="border-t border-[#1f1218]/10 transition-colors duration-200 hover:bg-[#ff9d66]/10">
                          <td className="py-3 pl-5 pr-3 whitespace-nowrap">{fmtDate(t.date)}</td>
                          <td className="px-3 py-3">
                            <span className="block font-semibold">{doc ? `${doc.number} · ${doc.party}` : t.note || t.category}</span>
                            <span className="text-xs text-[#5d4a52]">by {t.by}</span>
                          </td>
                          <td className="px-3 py-3">{accountName(t.accountId)}</td>
                          <td className="px-3 py-3">
                            <Chip tone="soft">{t.category}</Chip>
                          </td>
                          <td className={`py-3 pl-3 pr-5 text-right font-bold tabular-nums ${t.type === "out" ? "text-[#9f2a20]" : ""}`}>
                            {t.type === "out" ? "− " : "+ "}
                            {idr(t.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {txnRows.length === 0 && <Empty title="No transactions found" text="Try a different search or filter." onClear={() => (setCq(""), setAccountF("all"), setFlowF("all"), setCpage(1))} />}
              </div>
              <Pager page={cpage} size={data.pageSize} total={txnRows.length} onPage={setCpage} />
            </section>
          </Reveal>
        </>
      )}

      {/* modal */}
      {payModal && (
        <PaymentModal
          kind={payModal.kind}
          open={(payModal.kind === "invoice" ? invoices : bills).filter((c) => c.balance > 0)}
          accounts={data.accounts}
          today={data.today}
          initialDocId={payModal.docId}
          onClose={() => setPayModal(null)}
          onSubmit={recordPayment}
        />
      )}
      {txnModal && <TransactionModal accounts={data.accounts} categories={data.categories} today={data.today} onClose={() => setTxnModal(false)} onSubmit={addTxn} />}

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
