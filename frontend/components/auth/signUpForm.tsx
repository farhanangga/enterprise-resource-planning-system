"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

export type SignUpCopy = {
  lines: string[];
  text: string;
  steps: { title: string; text: string }[];
};

type Props = {
  existingEmails: string[];
  industries: string[];
  copy: SignUpCopy;
  redirectTo?: string;
};

type Values = {
  name: string;
  email: string;
  company: string;
  industry: string;
  password: string;
  confirm: string;
  terms: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

const inputBase =
  "h-12 w-full rounded-2xl border bg-white pl-11 pr-4 text-[15px] outline-none transition placeholder:text-[#5d4a52]/60 focus:ring-4";
const inputOk = "border-[#1f1218]/15 hover:border-[#1f1218]/30 focus:border-[#ff9d66] focus:ring-[#ff9d66]/25";
const inputBad = "border-[#c8362b] focus:ring-[#c8362b]/20";

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/i.test(p) && /\d/.test(p)) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (p.length >= 12 || /[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function validate(v: Values, existingEmails: string[]): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!v.email.trim()) e.email = "Please enter your email.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  else if (existingEmails.some((m) => m.toLowerCase() === v.email.trim().toLowerCase()))
    e.email = "This email is already registered. Try signing in.";
  if (v.company.trim().length < 2) e.company = "Please enter your company name.";
  if (!v.industry) e.industry = "Choose your industry.";
  if (v.password.length < 8) e.password = "Use at least 8 characters.";
  else if (!/[a-z]/i.test(v.password) || !/\d/.test(v.password)) e.password = "Include at least one letter and one number.";
  if (!v.confirm) e.confirm = "Please confirm your password.";
  else if (v.confirm !== v.password) e.confirm = "Passwords do not match.";
  if (!v.terms) e.terms = "You need to accept the terms to continue.";
  return e;
}

function Field({
  id,
  label,
  icon,
  error,
  right,
  children,
}: {
  id: string;
  label: string;
  icon: IconName;
  error?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      <div className="group relative">
        <Icon
          name={icon}
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5d4a52] transition-colors group-focus-within:text-[#e8641f]"
        />
        {children}
        {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#c8362b]">
          <Icon name="alert" className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function EyeToggle({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? "Hide password" : "Show password"}
      className="grid h-9 w-9 place-items-center rounded-full text-[#5d4a52] transition hover:bg-[#ff9d66]/25 hover:text-[#1f1218]"
    >
      <Icon name={show ? "eyeOff" : "eye"} className="h-[18px] w-[18px]" />
    </button>
  );
}

export default function SignUpForm({ existingEmails, industries, copy, redirectTo = "/dashboard" }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    company: "",
    industry: "",
    password: "",
    confirm: "",
    terms: false,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const errors = validate(values, existingEmails);
  const err = (k: keyof Values) => (touched[k] || submitted ? errors[k] : undefined);
  const score = strength(values.password);
  const busy = status !== "idle";

  const set = <K extends keyof Values>(k: K, val: Values[K]) => setValues((v) => ({ ...v, [k]: val }));
  const blur = (k: keyof Values) => setTouched((t) => ({ ...t, [k]: true }));
  const cls = (k: keyof Values) => `${inputBase} ${err(k) ? inputBad : inputOk}`;

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (busy) return;
    setSubmitted(true);
    if (Object.keys(errors).length) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 900)); // simulasi request

    try {
      window.localStorage.setItem(
        "etera:user",
        JSON.stringify({ name: values.name.trim(), email: values.email.trim(), role: "Owner", company: values.company.trim() }),
      );
    } catch {}
    setStatus("success");
  }

  return (
    <div className="relative grid min-h-[100svh] overflow-hidden bg-white text-[#1f1218] lg:grid-cols-[1.1fr_1fr]">
      {/* latar grid bersama */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,18,24,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_85%_80%_at_75%_50%,black,transparent)]"
      />

      {/* ===== Panel oranye (kiri) ===== */}
      <aside className="relative z-10 flex flex-col overflow-hidden rounded-br-[32px] bg-[#ff9d66] px-6 pb-10 pt-6 sm:px-10 lg:mb-10 lg:rounded-br-[44px] lg:px-14 lg:pt-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/15" />
        <div aria-hidden className="pointer-events-none absolute -bottom-36 left-[28%] h-80 w-80 rounded-full bg-[#1f1218]/[0.06]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(31,18,24,.16)_1.5px,transparent_1.5px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom_left,black,transparent_55%)]"
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <Reveal variant="down" delay={100}>
            <div className="flex items-center justify-between">
              <Link href="/" className="text-base font-black tracking-wide transition-transform duration-300 hover:scale-105">
                ETERA
              </Link>
              <Link href="/" className="group inline-flex items-center gap-1.5 text-[13px] font-semibold">
                <Icon name="arrow" className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to home
              </Link>
            </div>
          </Reveal>

          <div className="my-auto py-10 lg:py-6">
            <h1
              aria-label={copy.lines.join(" ")}
              className="text-[clamp(2.1rem,min(4.8vw,9vh),4rem)] font-black uppercase leading-[1.04] tracking-tight"
            >
              {copy.lines.map((line, i) => (
                <span key={line} aria-hidden className="block overflow-hidden pb-[0.05em]">
                  <Reveal as="span" variant="mask" delay={200 + i * 130} duration={900} className="block">
                    {line}
                  </Reveal>
                </span>
              ))}
            </h1>

            <Reveal delay={600}>
              <p className="mt-4 max-w-[30rem] text-sm font-semibold leading-relaxed text-white lg:text-[15px]">{copy.text}</p>
            </Reveal>

            <Reveal delay={750} className="mt-6 hidden max-w-[30rem] md:block">
              <ol className="grid gap-4 rounded-2xl bg-white p-5 shadow-[0_16px_32px_-14px_rgba(31,18,24,.45)] ring-1 ring-[#1f1218]/5">
                {copy.steps.map((s, i) => (
                  <li key={s.title} className="group flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ff9d66] text-sm font-black transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      {i + 1}
                    </span>
                    <span className="leading-snug">
                      <b className="block text-sm">{s.title}</b>
                      <span className="text-[13px] text-[#5d4a52]">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </aside>

      {/* ===== Form (kanan) ===== */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-[26rem]">
          {status === "success" ? (
            <Reveal variant="scale">
              <div className="rounded-[28px] bg-white p-8 text-center shadow-[0_24px_48px_-24px_rgba(31,18,24,.45)] ring-1 ring-[#1f1218]/5">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ff9d66]">
                  <Icon name="check" className="h-8 w-8" />
                </span>
                <h2 className="mt-5 text-2xl font-black tracking-tight">Account created</h2>
                <p className="mt-2 text-[#5d4a52]">
                  Welcome, {values.name.trim().split(" ")[0]}. We sent a verification link to{" "}
                  <b className="text-[#1f1218]">{values.email.trim()}</b>.
                </p>
                <button
                  type="button"
                  onClick={() => router.push(redirectTo)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1218] px-8 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218]"
                >
                  Go to dashboard
                  <Icon name="arrow" className="h-4 w-4" />
                </button>
              </div>
            </Reveal>
          ) : (
            <>
              <Reveal>
                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Create account</h2>
                <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
                <p className="mt-3 text-[#5d4a52]">Set up your company workspace in a few steps.</p>
              </Reveal>

              <Reveal delay={150}>
                <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-4">
                  <Field id="name" label="Full name" icon="user" error={err("name")}>
                    <input
                      id="name"
                      autoComplete="name"
                      placeholder="Your full name"
                      value={values.name}
                      onChange={(e) => set("name", e.target.value)}
                      onBlur={() => blur("name")}
                      aria-invalid={!!err("name")}
                      className={cls("name")}
                    />
                  </Field>

                  <Field id="email" label="Email" icon="mail" error={err("email")}>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      value={values.email}
                      onChange={(e) => set("email", e.target.value)}
                      onBlur={() => blur("email")}
                      aria-invalid={!!err("email")}
                      className={cls("email")}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="company" label="Company name" icon="building" error={err("company")}>
                      <input
                        id="company"
                        autoComplete="organization"
                        placeholder="Your company"
                        value={values.company}
                        onChange={(e) => set("company", e.target.value)}
                        onBlur={() => blur("company")}
                        aria-invalid={!!err("company")}
                        className={cls("company")}
                      />
                    </Field>

                    <Field id="industry" label="Industry" icon="operations" error={err("industry")}>
                      <select
                        id="industry"
                        value={values.industry}
                        onChange={(e) => set("industry", e.target.value)}
                        onBlur={() => blur("industry")}
                        aria-invalid={!!err("industry")}
                        className={`${cls("industry")} cursor-pointer appearance-none pr-10 ${values.industry ? "" : "text-[#5d4a52]/60"}`}
                      >
                        <option value="">Select…</option>
                        {industries.map((i) => (
                          <option key={i} value={i} className="text-[#1f1218]">
                            {i}
                          </option>
                        ))}
                      </select>
                      <Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5d4a52]" />
                    </Field>
                  </div>

                  <div>
                    <Field
                      id="password"
                      label="Password"
                      icon="lock"
                      error={err("password")}
                      right={<EyeToggle show={showPw} onClick={() => setShowPw(!showPw)} />}
                    >
                      <input
                        id="password"
                        type={showPw ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters, letters and numbers"
                        value={values.password}
                        onChange={(e) => set("password", e.target.value)}
                        onBlur={() => blur("password")}
                        aria-invalid={!!err("password")}
                        className={`${cls("password")} pr-12`}
                      />
                    </Field>
                    {values.password && (
                      <div className="mt-2 flex items-center gap-3" aria-live="polite">
                        <div className="flex flex-1 gap-1.5">
                          {[1, 2, 3, 4].map((n) => (
                            <span
                              key={n}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                score >= n ? (score === 4 ? "bg-[#1f1218]" : "bg-[#ff9d66]") : "bg-[#1f1218]/10"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="w-16 text-right text-xs font-bold text-[#5d4a52]">{strengthLabels[score]}</span>
                      </div>
                    )}
                  </div>

                  <Field
                    id="confirm"
                    label="Confirm password"
                    icon="lock"
                    error={err("confirm")}
                    right={<EyeToggle show={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />}
                  >
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={values.confirm}
                      onChange={(e) => set("confirm", e.target.value)}
                      onBlur={() => blur("confirm")}
                      aria-invalid={!!err("confirm")}
                      className={`${cls("confirm")} pr-12`}
                    />
                  </Field>

                  <div>
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm font-semibold leading-snug">
                      <input
                        type="checkbox"
                        checked={values.terms}
                        onChange={(e) => {
                          set("terms", e.target.checked);
                          blur("terms");
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#1f1218]"
                      />
                      <span>
                        I agree to the{" "}
                        <Link href="/terms" className="font-bold text-[#e8641f] hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="font-bold text-[#e8641f] hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    {err("terms") && (
                      <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-[#c8362b]">
                        <Icon name="alert" className="h-4 w-4 shrink-0" />
                        {err("terms")}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1218] px-8 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218] disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e7be0]"
                  >
                    {status === "loading" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create account
                        <Icon name="arrow" className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </Reveal>

              <Reveal delay={300}>
                <p className="mt-7 text-center text-sm text-[#5d4a52]">
                  Already have an account?{" "}
                  <Link href="/signin" className="font-bold text-[#1f1218] underline decoration-[#ff9d66] decoration-2 underline-offset-4 hover:text-[#e8641f]">
                    Sign in
                  </Link>
                </p>
              </Reveal>
            </>
          )}
        </div>
      </main>
    </div>
  );
}