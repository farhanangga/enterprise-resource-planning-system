"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/components/dashboard/app-context";
import Chip from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Field, btnGhost, btnPrimary, fieldCls } from "@/components/ui/Modal";
import Reveal from "@/components/ui/Reveal";
import type { CompanySettings, NotifChannel, SettingsData } from "./types";

type Tab = "profile" | "company" | "notifications";
type Prefs = Record<string, Record<NotifChannel, boolean>>;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ---------- potongan UI ---------- */

function Card({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#1f1218]/10 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      {text && <p className="mt-1 text-sm text-[#5d4a52]">{text}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e7be0] ${checked ? "bg-[#1f1218]" : "bg-[#1f1218]/20"}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function Error({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl bg-[#c8362b]/10 px-4 py-2.5 text-sm font-semibold text-[#9f2a20]">
      {children}
    </p>
  );
}

function SaveBar({ dirty, onReset }: { dirty: boolean; onReset: () => void }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#1f1218]/10 pt-5">
      <span className="mr-auto text-xs font-semibold text-[#5d4a52]">{dirty ? "You have unsaved changes." : "All changes saved."}</span>
      <button type="button" onClick={onReset} disabled={!dirty} className={`${btnGhost} disabled:pointer-events-none disabled:opacity-50`}>
        Discard
      </button>
      <button type="submit" disabled={!dirty} className={btnPrimary}>
        Save changes
      </button>
    </div>
  );
}

/* ---------- halaman ---------- */

export default function SettingsView({ data }: { data: SettingsData }) {
  const { user, can, role, roleInfo } = useApp();

  const canView = can("settings:view");
  const canCompany = can("settings:company");

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    ...(canCompany ? [{ id: "company" as Tab, label: "Company" }] : []),
    { id: "notifications", label: "Notifications" },
  ];
  const [tab, setTab] = useState<Tab>("profile");
  const active: Tab = tabs.some((t) => t.id === tab) ? tab : "profile";

  /* --- profil --- */
  const [profile, setProfile] = useState({ name: user.name, phone: "" });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [profileErr, setProfileErr] = useState<string>();

  /* --- password --- */
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState<string>();
  const [showPw, setShowPw] = useState(false);

  /* --- perusahaan --- */
  const initialCompany: CompanySettings = { ...data.company, name: user.company || data.company.name };
  const [company, setCompany] = useState(initialCompany);
  const [companyDraft, setCompanyDraft] = useState(initialCompany);
  const [companyErr, setCompanyErr] = useState<string>();

  /* --- notifikasi: hanya jenis yang boleh dilihat peran ini --- */
  const events = data.notifications.filter((n) => can(n.perm));
  const initialPrefs: Prefs = Object.fromEntries(data.notifications.map((n) => [n.id, { ...n.defaults }]));
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs);
  const [prefsDraft, setPrefsDraft] = useState<Prefs>(initialPrefs);

  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function saveProfile(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!profileDraft.name.trim()) return setProfileErr("Enter your name.");
    const next = { name: profileDraft.name.trim(), phone: profileDraft.phone.trim() };
    setProfile(next);
    setProfileDraft(next);
    setProfileErr(undefined);
    setToast("Profile saved");
  }

  function savePassword(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!pw.current) return setPwErr("Enter your current password.");
    if (pw.next.length < data.passwordMinLength) return setPwErr(`The new password needs at least ${data.passwordMinLength} characters.`);
    if (pw.next === pw.current) return setPwErr("Choose a password different from the current one.");
    if (pw.next !== pw.confirm) return setPwErr("The new passwords don’t match.");
    setPw({ current: "", next: "", confirm: "" });
    setPwErr(undefined);
    setToast("Password updated");
  }

  function saveCompany(e: { preventDefault(): void }) {
    e.preventDefault();
    const c = companyDraft;
    if (!c.name.trim()) return setCompanyErr("Enter the business name.");
    if (c.email.trim() && !EMAIL_RE.test(c.email.trim())) return setCompanyErr("Enter a valid business email.");
    if (!Number.isFinite(c.taxRate) || c.taxRate < 0 || c.taxRate > 100) return setCompanyErr("Tax rate must be between 0 and 100.");
    if (!c.invoicePrefix.trim()) return setCompanyErr("Enter an invoice prefix, e.g. INV.");
    const next = { ...c, name: c.name.trim(), address: c.address.trim(), phone: c.phone.trim(), email: c.email.trim(), taxId: c.taxId.trim(), invoicePrefix: c.invoicePrefix.trim().toUpperCase() };
    setCompany(next);
    setCompanyDraft(next);
    setCompanyErr(undefined);
    setToast("Company details saved");
  }

  function savePrefs(e: { preventDefault(): void }) {
    e.preventDefault();
    setPrefs(prefsDraft);
    setToast("Notification preferences saved");
  }

  const setPref = (id: string, ch: NotifChannel, v: boolean) => setPrefsDraft((p) => ({ ...p, [id]: { ...p[id], [ch]: v } }));
  const setAllPrefs = (ch: NotifChannel, v: boolean) =>
    setPrefsDraft((p) => ({ ...p, ...Object.fromEntries(events.map((n) => [n.id, { ...p[n.id], [ch]: v }])) }));

  /* ---------- tanpa akses ---------- */
  if (!canView) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <Reveal variant="scale">
          <div className="rounded-[28px] border border-[#1f1218]/10 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ff9d66]/25">
              <Icon name="shield" className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-2xl font-black tracking-tight">No access to Settings</h1>
            <p className="mt-2 text-[#5d4a52]">The {roleInfo[role].label} role can’t open this page. Ask an Owner or Admin if you need access.</p>
            <Link href="/dashboard/main" className={`${btnPrimary} mt-6`}>
              Back to dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  const profileDirty = !sameJson(profile, profileDraft);
  const companyDirty = !sameJson(company, companyDraft);
  const prefsDirty = !sameJson(prefs, prefsDraft);
  const pwFilled = !!(pw.current || pw.next || pw.confirm);
  const initials = profileDraft.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "U";

  return (
    <div className="mx-auto grid max-w-[960px] gap-5">
      {/* judul */}
      <Reveal>
        <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Settings</h1>
        <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
        <p className="mt-3 max-w-xl text-[#5d4a52]">Manage your profile, business details, and how you hear from ETERA.</p>
      </Reveal>

      {/* tab */}
      <Reveal delay={100}>
        <div role="tablist" aria-label="Settings sections" className="inline-flex flex-wrap gap-1 rounded-full bg-[#1f1218]/[0.06] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-200 ${active === t.id ? "bg-[#1f1218] text-white" : "text-[#5d4a52] hover:text-[#1f1218]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* ===== PROFIL ===== */}
      {active === "profile" && (
        <Reveal delay={180}>
          <div className="grid gap-5">
            <Card title="Your profile" text="This is how you appear to your team.">
              <form onSubmit={saveProfile} noValidate>
                <div className="mb-5 flex items-center gap-4">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ff9d66] text-xl font-black">{initials}</span>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-base font-black">{profileDraft.name || "—"}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#5d4a52]">
                      <Chip tone="brown">{roleInfo[role].label}</Chip>
                      <span className="truncate">{company.name}</span>
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="p-name" label="Full name">
                    <input id="p-name" value={profileDraft.name} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} className={fieldCls(!!profileErr && !profileDraft.name.trim())} />
                  </Field>
                  <Field id="p-phone" label="Phone (optional)">
                    <input id="p-phone" value={profileDraft.phone} onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })} inputMode="tel" placeholder="0812-0000-0000" className={fieldCls()} />
                  </Field>
                  <Field id="p-email" label="Email" hint="Your email is your sign-in. Contact an Admin to change it.">
                    <input id="p-email" value={user.email} readOnly className={`${fieldCls()} cursor-not-allowed bg-[#1f1218]/[0.04] text-[#5d4a52]`} />
                  </Field>
                  <Field id="p-role" label="Role" hint={roleInfo[role].description}>
                    <input id="p-role" value={roleInfo[role].label} readOnly className={`${fieldCls()} cursor-not-allowed bg-[#1f1218]/[0.04] text-[#5d4a52]`} />
                  </Field>
                </div>
                <div className="mt-4">
                  <Error>{profileErr}</Error>
                </div>
                <SaveBar dirty={profileDirty} onReset={() => (setProfileDraft(profile), setProfileErr(undefined))} />
              </form>
            </Card>

            <Card title="Password" text={`Use at least ${data.passwordMinLength} characters. You’ll stay signed in on this device.`}>
              <form onSubmit={savePassword} noValidate className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field id="pw-current" label="Current password">
                    <input id="pw-current" type={showPw ? "text" : "password"} autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={fieldCls(!!pwErr && !pw.current)} />
                  </Field>
                  <Field id="pw-next" label="New password">
                    <input id="pw-next" type={showPw ? "text" : "password"} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={fieldCls(!!pwErr && pw.next.length < data.passwordMinLength)} />
                  </Field>
                  <Field id="pw-confirm" label="Confirm new password">
                    <input id="pw-confirm" type={showPw ? "text" : "password"} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={fieldCls(!!pwErr && pw.next !== pw.confirm)} />
                  </Field>
                </div>
                <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-[#5d4a52]">
                  <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} className="h-4 w-4 accent-[#1f1218]" />
                  Show passwords
                </label>
                <Error>{pwErr}</Error>
                <div className="flex justify-end">
                  <button type="submit" disabled={!pwFilled} className={btnPrimary}>
                    <Icon name="lock" className="h-4 w-4" />
                    Update password
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </Reveal>
      )}

      {/* ===== PERUSAHAAN ===== */}
      {active === "company" && canCompany && (
        <Reveal delay={180}>
          <Card title="Company details" text="Used on invoices, purchase orders, and reports.">
            <form onSubmit={saveCompany} noValidate className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="c-name" label="Business name">
                  <input id="c-name" value={companyDraft.name} onChange={(e) => setCompanyDraft({ ...companyDraft, name: e.target.value })} className={fieldCls(!!companyErr && !companyDraft.name.trim())} />
                </Field>
                <Field id="c-taxid" label="Tax ID / NPWP (optional)">
                  <input id="c-taxid" value={companyDraft.taxId} onChange={(e) => setCompanyDraft({ ...companyDraft, taxId: e.target.value })} placeholder="00.000.000.0-000.000" className={fieldCls()} />
                </Field>
              </div>
              <Field id="c-address" label="Address">
                <textarea id="c-address" rows={2} value={companyDraft.address} onChange={(e) => setCompanyDraft({ ...companyDraft, address: e.target.value })} className={`${fieldCls()} h-auto resize-none py-3`} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="c-phone" label="Business phone (optional)">
                  <input id="c-phone" value={companyDraft.phone} onChange={(e) => setCompanyDraft({ ...companyDraft, phone: e.target.value })} inputMode="tel" className={fieldCls()} />
                </Field>
                <Field id="c-email" label="Business email (optional)">
                  <input id="c-email" type="email" value={companyDraft.email} onChange={(e) => setCompanyDraft({ ...companyDraft, email: e.target.value })} className={fieldCls(!!companyErr && !!companyDraft.email && !EMAIL_RE.test(companyDraft.email))} />
                </Field>
              </div>

              <div className="mt-2 border-t border-[#1f1218]/10 pt-5">
                <h3 className="text-sm font-black">Billing defaults</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field id="c-currency" label="Currency">
                  <select id="c-currency" value={companyDraft.currency} onChange={(e) => setCompanyDraft({ ...companyDraft, currency: e.target.value })} className={`${fieldCls()} cursor-pointer`}>
                    <option value="IDR">IDR – Rupiah</option>
                  </select>
                </Field>
                <Field id="c-tz" label="Time zone">
                  <select id="c-tz" value={companyDraft.timezone} onChange={(e) => setCompanyDraft({ ...companyDraft, timezone: e.target.value })} className={`${fieldCls()} cursor-pointer`}>
                    {data.timezones.map((z) => (
                      <option key={z.value} value={z.value}>
                        {z.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field id="c-tax" label="Tax rate / PPN (%)">
                  <input id="c-tax" type="number" min={0} max={100} step="0.1" inputMode="decimal" value={Number.isNaN(companyDraft.taxRate) ? "" : companyDraft.taxRate} onChange={(e) => setCompanyDraft({ ...companyDraft, taxRate: e.target.value === "" ? NaN : Number(e.target.value) })} className={fieldCls(!!companyErr && !(companyDraft.taxRate >= 0 && companyDraft.taxRate <= 100))} />
                </Field>
                <Field id="c-prefix" label="Invoice prefix" hint={`e.g. ${companyDraft.invoicePrefix.trim().toUpperCase() || "INV"}-2201`}>
                  <input id="c-prefix" maxLength={8} value={companyDraft.invoicePrefix} onChange={(e) => setCompanyDraft({ ...companyDraft, invoicePrefix: e.target.value })} className={`${fieldCls(!!companyErr && !companyDraft.invoicePrefix.trim())} uppercase`} />
                </Field>
              </div>

              <Error>{companyErr}</Error>
              <SaveBar dirty={companyDirty} onReset={() => (setCompanyDraft(company), setCompanyErr(undefined))} />
            </form>
          </Card>
        </Reveal>
      )}

      {/* ===== NOTIFIKASI ===== */}
      {active === "notifications" && (
        <Reveal delay={180}>
          <Card title="Notifications" text="Choose what you’re told about, and where. Only events relevant to your role are listed.">
            <form onSubmit={savePrefs}>
              {events.length === 0 ? (
                <p className="rounded-xl bg-[#ff9d66]/15 px-4 py-3 text-sm font-semibold text-[#5d4a52]">There are no notifications for your role yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="text-xs font-bold uppercase tracking-wider text-[#5d4a52]">
                        <th className="py-2 pr-3">Event</th>
                        {(["inApp", "email"] as NotifChannel[]).map((ch) => {
                          const all = events.every((n) => prefsDraft[n.id][ch]);
                          return (
                            <th key={ch} className="w-28 px-3 py-2 text-center">
                              <span className="block">{ch === "inApp" ? "In-app" : "Email"}</span>
                              <button type="button" onClick={() => setAllPrefs(ch, !all)} className="mt-1 text-[11px] font-bold normal-case tracking-normal text-[#e8641f] hover:underline">
                                {all ? "Turn all off" : "Turn all on"}
                              </button>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((n) => (
                        <tr key={n.id} className="border-t border-[#1f1218]/10">
                          <td className="py-4 pr-3">
                            <b className="block">{n.label}</b>
                            <span className="text-xs text-[#5d4a52]">{n.description}</span>
                          </td>
                          {(["inApp", "email"] as NotifChannel[]).map((ch) => (
                            <td key={ch} className="px-3 py-4">
                              <span className="flex justify-center">
                                <Toggle checked={prefsDraft[n.id][ch]} onChange={(v) => setPref(n.id, ch, v)} label={`${n.label} – ${ch === "inApp" ? "in-app" : "email"}`} />
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <SaveBar dirty={prefsDirty} onReset={() => setPrefsDraft(prefs)} />
            </form>
          </Card>
        </Reveal>
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
