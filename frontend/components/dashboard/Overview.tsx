"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import type { DashboardData, Permission, Role, SessionUser } from "./types";

type Props = {
  data: DashboardData;
  role: Role;
  user: SessionUser;
  can: (perm: Permission) => boolean;
};

const jt = (n: number) => `Rp ${n.toFixed(1).replace(".", ",")} jt`;

const tones = {
  orange: "bg-[#ff9d66]/25 text-[#1f1218]",
  brown: "bg-[#1f1218] text-white",
  red: "bg-[#c8362b]/10 text-[#9f2a20]",
  soft: "bg-[#1f1218]/[0.08] text-[#1f1218]",
} as const;

function Chip({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Card({ title, icon, aside, children }: { title: string; icon: IconName; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="h-full rounded-[24px] border border-[#1f1218]/10 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-[0_18px_40px_-22px_rgba(31,18,24,.35)]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#ff9d66]/25">
            <Icon name={icon} className="h-4 w-4" />
          </span>
          <h3 className="text-[15px] font-black">{title}</h3>
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* ---------- Grafik penjualan vs pembelian ---------- */
function SalesChart({ chart }: { chart: DashboardData["chart"] }) {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, [range]);

  const set = chart[range];
  const max = Math.max(...set.sales, ...set.purchases);
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const tabs = (
    <div className="flex rounded-full bg-[#1f1218]/[0.06] p-1 text-xs font-bold">
      {(["7d", "30d"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRange(r)}
          aria-pressed={range === r}
          className={`rounded-full px-3 py-1 transition-colors duration-200 ${
            range === r ? "bg-[#1f1218] text-white" : "text-[#5d4a52] hover:text-[#1f1218]"
          }`}
        >
          {r === "7d" ? "7 days" : "30 days"}
        </button>
      ))}
    </div>
  );

  return (
    <Card title="Sales vs Purchases" icon="reports" aside={tabs}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <span className="h-3 w-3 rounded-sm bg-[#ff9d66]" /> Sales <b className="font-black">{jt(sum(set.sales))}</b>
        </span>
        <span className="flex items-center gap-2 font-semibold">
          <span className="h-3 w-3 rounded-sm bg-[#1f1218]" /> Purchases <b className="font-black">{jt(sum(set.purchases))}</b>
        </span>
      </div>

      <div className="relative mt-5 h-52">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} aria-hidden className="absolute inset-x-0 border-t border-dashed border-[#1f1218]/10" style={{ top: `${i * 33.33}%` }} />
        ))}
        <div className="relative flex h-full items-end gap-2 sm:gap-4">
          {set.labels.map((l, i) => (
            <div key={l} className="group flex h-full flex-1 items-end justify-center gap-1">
              <div
                title={`${l} sales: ${jt(set.sales[i])}`}
                className="w-full max-w-[24px] rounded-t-md bg-[#ff9d66] transition-[height,background-color] duration-700 ease-out group-hover:bg-[#ff8a4a]"
                style={{ height: ready ? `${(set.sales[i] / max) * 100}%` : "0%", transitionDelay: `${i * 50}ms` }}
              />
              <div
                title={`${l} purchases: ${jt(set.purchases[i])}`}
                className="w-full max-w-[24px] rounded-t-md bg-[#1f1218] transition-[height,background-color] duration-700 ease-out group-hover:bg-[#3a2730]"
                style={{ height: ready ? `${(set.purchases[i] / max) * 100}%` : "0%", transitionDelay: `${i * 50 + 80}ms` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-2 sm:gap-4">
        {set.labels.map((l) => (
          <span key={l} className="flex-1 text-center text-xs font-semibold text-[#5d4a52]">
            {l}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default function Overview({ data, role, user, can }: Props) {
  const info = data.roleInfo[role];
  const first = user.name.split(" ")[0];
  const [tasks, setTasks] = useState(data.tasks);

  const kpis = data.kpis.filter((k) => can(k.perm));
  const actions = data.quickActions.filter((a) => can(a.perm)).slice(0, 3);
  const areas = data.activityAreas[role];
  const activity = data.activity.filter((a) => a.areas.some((x) => areas.includes(x)));

  const kpiCols: Record<number, string> = { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4" };
  const net = data.cashflow.inflow - data.cashflow.outflow;
  const onboardingDone = data.onboarding.filter((o) => o.done).length;
  const maxTeam = Math.max(...data.team.byRole.map((t) => t.count));
  const maxSold = Math.max(...data.topProducts.map((p) => p.sold));

  const orderTone = (s: string) => (s === "Ready to ship" ? "brown" : s === "Confirmed" ? "orange" : "soft");

  const widgets: { key: string; perm: Permission; span?: string; node: ReactNode }[] = [
    { key: "chart", perm: "chart:sales", span: "md:col-span-2", node: <SalesChart chart={data.chart} /> },

    {
      key: "tasks",
      perm: "kpi:staff",
      node: (
        <Card title="My tasks today" icon="check" aside={<Chip tone="orange">{tasks.filter((t) => t.done).length}/{tasks.length}</Chip>}>
          <ul className="grid gap-2">
            {tasks.map((t) => (
              <li key={t.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition-colors hover:bg-[#ff9d66]/15">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                    className="h-4 w-4 rounded accent-[#1f1218]"
                  />
                  <span className={t.done ? "text-[#5d4a52] line-through" : ""}>{t.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },

    {
      key: "cashflow",
      perm: "finance:cashflow",
      node: (
        <Card title="Cash flow" icon="finance" aside={<Chip tone="soft">This month</Chip>}>
          <p className="text-sm font-semibold text-[#5d4a52]">Net cash</p>
          <p className="mt-1 text-3xl font-black">{jt(net)}</p>
          <div className="mt-5 grid gap-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-bold">
                <span>Money in</span>
                <span>{jt(data.cashflow.inflow)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#1f1218]/[0.06]">
                <div className="h-full w-full rounded-full bg-[#ff9d66]" />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-bold">
                <span>Money out</span>
                <span>{jt(data.cashflow.outflow)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#1f1218]/[0.06]">
                <div className="h-full rounded-full bg-[#1f1218]" style={{ width: `${(data.cashflow.outflow / data.cashflow.inflow) * 100}%` }} />
              </div>
            </div>
          </div>
        </Card>
      ),
    },

    {
      key: "aging",
      perm: "finance:receivables",
      node: (
        <Card title="Receivables aging" icon="finance">
          <ul className="grid gap-4">
            {data.receivables.map((r, i) => (
              <li key={r.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold">{r.label}</span>
                  <b className="font-black">{r.value}</b>
                </div>
                <div className="h-2.5 rounded-full bg-[#1f1218]/[0.06]">
                  <div className={`h-full rounded-full ${i >= 2 ? "bg-[#1f1218]" : "bg-[#ff9d66]"}`} style={{ width: `${r.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },

    {
      key: "orders",
      perm: "orders:pending",
      node: (
        <Card title="Orders to process" icon="sales" aside={<Chip tone="orange">{data.orders.length} open</Chip>}>
          <ul className="grid gap-1">
            {data.orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#ff9d66]/15">
                <span className="min-w-0 leading-tight">
                  <b className="block text-sm">{o.id}</b>
                  <span className="block truncate text-xs text-[#5d4a52]">{o.customer}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <b className="text-sm font-black">{o.total}</b>
                  <Chip tone={orderTone(o.status)}>{o.status}</Chip>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },

    {
      key: "invoices",
      perm: "invoices:unpaid",
      node: (
        <Card title="Unpaid invoices" icon="finance" aside={<Chip tone="red">{data.invoices.filter((i) => i.overdue).length} overdue</Chip>}>
          <ul className="grid gap-1">
            {data.invoices.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#ff9d66]/15">
                <span className="min-w-0 leading-tight">
                  <b className="block text-sm">{i.id}</b>
                  <span className="block truncate text-xs text-[#5d4a52]">{i.customer}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <b className="text-sm font-black">{i.amount}</b>
                  <Chip tone={i.overdue ? "red" : "soft"}>{i.due}</Chip>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },

    {
      key: "top",
      perm: "products:top",
      node: (
        <Card title="Top products" icon="inventory" aside={<Chip tone="soft">This week</Chip>}>
          <ul className="grid gap-3.5">
            {data.topProducts.map((p, i) => (
              <li key={p.name}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <span className="truncate font-semibold">
                    {i + 1}. {p.name}
                  </span>
                  <b className="font-black">{p.sold}</b>
                </div>
                <div className="h-2 rounded-full bg-[#1f1218]/[0.06]">
                  <div className="h-full rounded-full bg-[#ff9d66]" style={{ width: `${(p.sold / maxSold) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },

    {
      key: "stock",
      perm: "stock:low",
      node: (
        <Card title="Low stock" icon="alert" aside={<Chip tone="red">{data.lowStock.length} items</Chip>}>
          <ul className="grid gap-1">
            {data.lowStock.map((s) => (
              <li key={s.sku} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[#ff9d66]/15">
                <span className="min-w-0 leading-tight">
                  <b className="block truncate text-sm">{s.name}</b>
                  <span className="text-xs text-[#5d4a52]">{s.sku}</span>
                </span>
                <span className="text-right leading-tight">
                  <b className="block text-sm font-black text-[#9f2a20]">{s.stock} left</b>
                  <span className="text-xs text-[#5d4a52]">min {s.min}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },

    {
      key: "team",
      perm: "team:manage",
      node: (
        <Card title="Team" icon="hr" aside={<Chip tone="soft">{data.team.byRole.reduce((a, t) => a + t.count, 0)} members</Chip>}>
          <ul className="grid gap-3">
            {data.team.byRole.map((t) => (
              <li key={t.role} className="flex items-center gap-3 text-sm">
                <span className="w-16 font-semibold">{t.role}</span>
                <span className="h-2 flex-1 rounded-full bg-[#1f1218]/[0.06]">
                  <span className="block h-full rounded-full bg-[#ff9d66]" style={{ width: `${(t.count / maxTeam) * 100}%` }} />
                </span>
                <b className="w-4 text-right font-black">{t.count}</b>
              </li>
            ))}
          </ul>
          {data.team.invites.map((inv) => (
            <p key={inv.email} className="mt-4 flex items-center gap-2 rounded-xl bg-[#ff9d66]/15 px-3 py-2 text-xs font-semibold">
              <Icon name="mail" className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">{inv.email}</span>
              <Chip tone="soft">Invited · {inv.role}</Chip>
            </p>
          ))}
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1218] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218]"
          >
            <Icon name="plus" className="h-4 w-4" />
            Invite member
          </button>
        </Card>
      ),
    },

    {
      key: "plan",
      perm: "billing:plan",
      node: (
        <section className="relative h-full overflow-hidden rounded-[24px] bg-[#1f1218] p-5 text-white shadow-sm">
          <div aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ff9d66]/25" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-wider text-[#ff9d66]">Subscription</p>
            <h3 className="mt-2 text-2xl font-black">{data.plan.name}</h3>
            <p className="mt-1 text-lg font-bold">{data.plan.price}</p>
            <p className="mt-3 text-sm text-white/70">{data.plan.note}</p>
            <p className="mt-1 text-sm font-semibold text-white/90">{data.plan.renews}</p>
            <button
              type="button"
              className="mt-5 rounded-full bg-[#ff9d66] px-5 py-2.5 text-sm font-semibold text-[#1f1218] transition-colors duration-200 hover:bg-white"
            >
              Manage plan
            </button>
          </div>
        </section>
      ),
    },

    {
      key: "onboarding",
      perm: "onboarding:view",
      node: (
        <Card title="Get started" icon="check" aside={<Chip tone="orange">{onboardingDone}/{data.onboarding.length}</Chip>}>
          <div className="mb-4 h-2.5 rounded-full bg-[#1f1218]/[0.06]">
            <div className="h-full rounded-full bg-[#ff9d66] transition-[width] duration-700" style={{ width: `${(onboardingDone / data.onboarding.length) * 100}%` }} />
          </div>
          <ul className="grid gap-2.5">
            {data.onboarding.map((o) => (
              <li key={o.label} className="flex items-center gap-3 text-sm font-semibold">
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                    o.done ? "bg-[#1f1218] text-[#ff9d66]" : "border-2 border-[#1f1218]/20"
                  }`}
                >
                  {o.done && <Icon name="check" className="h-3 w-3" />}
                </span>
                <span className={o.done ? "text-[#5d4a52] line-through" : ""}>{o.label}</span>
              </li>
            ))}
          </ul>
        </Card>
      ),
    },

    {
      key: "activity",
      perm: "activity:view",
      node: (
        <Card title="Recent activity" icon="clock">
          {activity.length === 0 ? (
            <p className="text-sm text-[#5d4a52]">No activity yet.</p>
          ) : (
            <ol className="relative grid gap-4 before:absolute before:bottom-1 before:left-[5px] before:top-1 before:w-px before:bg-[#1f1218]/10">
              {activity.map((a) => (
                <li key={a.text + a.time} className="relative pl-6 text-sm">
                  <span className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full bg-[#ff9d66] ring-4 ring-white" />
                  <p className="leading-snug">
                    <b className="font-black">{a.who}</b> {a.text}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5d4a52]">{a.time}</p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      ),
    },
  ];

  const visible = widgets.filter((w) => can(w.perm));

  return (
    <div className="mx-auto grid max-w-[1320px] gap-5">
      {/* banner sapaan */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[28px] rounded-br-[56px] bg-[#ff9d66] p-6 text-[#1f1218] sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/15" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 left-[35%] h-64 w-64 rounded-full bg-[#1f1218]/[0.06]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(31,18,24,.16)_1.5px,transparent_1.5px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom_left,black,transparent_55%)]"
          />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-block rounded-full bg-[#1f1218] px-3 py-1 text-xs font-bold text-white">{info.label}</span>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
                {greeting()}, {first}
              </h1>
              <p className="mt-2 text-sm font-semibold text-[#1f1218]/80 sm:text-[15px]">{info.description}</p>
            </div>
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {actions.map((a, i) => (
                  <button
                    key={a.label}
                    type="button"
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      i === 0
                        ? "bg-[#1f1218] text-white hover:bg-white hover:text-[#1f1218]"
                        : "bg-white text-[#1f1218] hover:bg-[#1f1218] hover:text-white"
                    }`}
                  >
                    <Icon name={a.icon} className="h-4 w-4" />
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      {/* KPI */}
      {kpis.length > 0 && (
        <div className={`grid gap-4 sm:grid-cols-2 ${kpiCols[kpis.length] ?? "xl:grid-cols-4"}`}>
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={80 + i * 70} className="h-full">
              <div className="group h-full rounded-[24px] border border-[#1f1218]/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff9d66] hover:shadow-[0_18px_40px_-22px_rgba(255,157,102,.9)]">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ff9d66]/25 transition-colors duration-300 group-hover:bg-[#ff9d66]">
                    <Icon name={k.icon} className="h-5 w-5" />
                  </span>
                  <Chip tone={k.good ? "orange" : k.trend === "flat" ? "soft" : "red"}>
                    {k.trend !== "flat" && (
                      <Icon name="arrow" className={`h-3 w-3 ${k.trend === "up" ? "-rotate-45" : "rotate-45"}`} />
                    )}
                    {k.delta}
                  </Chip>
                </div>
                <p className="mt-4 text-sm font-semibold text-[#5d4a52]">{k.label}</p>
                <p className="mt-1 text-2xl font-black tracking-tight">{k.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {/* widget sesuai peran */}
      <div className="grid gap-5 [grid-auto-flow:dense] md:grid-cols-2 lg:grid-cols-3">
        {visible.map((w, i) => (
          <Reveal key={`${role}-${w.key}`} delay={150 + i * 70} className={`h-full ${w.span ?? ""}`}>
            {w.node}
          </Reveal>
        ))}
      </div>
    </div>
  );
}
