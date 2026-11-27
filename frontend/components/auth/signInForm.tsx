"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { saveSession } from "@/lib/session";

export type Account = { name: string; email: string; password: string; role: string; company: string };
export type SignInCopy = { lines: string[]; text: string; perks: string[] };

type Props = {
  accounts: Account[];
  copy: SignInCopy;
  redirectTo?: string;
  signUpHref?: string;
  forgotHref?: string;
  showDemoHint?: boolean;
};

type Errors = { email?: string; password?: string; form?: string };

const MAX_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputBase =
  "h-12 w-full rounded-2xl border bg-white pl-11 pr-4 text-[15px] outline-none transition placeholder:text-[#5d4a52]/60 focus:ring-4";
const inputOk = "border-[#1f1218]/15 hover:border-[#1f1218]/30 focus:border-[#ff9d66] focus:ring-[#ff9d66]/25";
const inputBad = "border-[#c8362b] focus:ring-[#c8362b]/20";

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

export default function SignInForm({
  accounts,
  copy,
  redirectTo = "/dashboard",
  signUpHref = "/auth/signUp",
  forgotHref = "/forgot-password",
  showDemoHint = false,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const locked = attempts >= MAX_ATTEMPTS;
  const busy = status !== "idle";

  async function onSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (locked || busy) return;

    const next: Errors = {};
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Please enter your password.";
    setErrors(next);
    if (next.email || next.password) return;

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 800)); // simulasi request

    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );

    if (!account) {
      const n = attempts + 1;
      setAttempts(n);
      setStatus("idle");
      setErrors({
        form:
          n >= MAX_ATTEMPTS
            ? "Too many failed attempts. Please try again in 15 minutes."
            : `Incorrect email or password. ${MAX_ATTEMPTS - n} attempt${MAX_ATTEMPTS - n === 1 ? "" : "s"} left.`,
      });
      return;
    }

    // sesi sederhana (prototipe): tanpa password. Peran dipakai dashboard.
    saveSession({ name: account.name, email: account.email, role: account.role, company: account.company }, remember);

    setStatus("success");
    setTimeout(() => router.push(redirectTo), 700);
  }

  function fillAccount(a: Account) {
    setEmail(a.email);
    setPassword(a.password);
    setErrors({});
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
              <ul className="grid gap-3 rounded-2xl bg-white p-5 shadow-[0_16px_32px_-14px_rgba(31,18,24,.45)] ring-1 ring-[#1f1218]/5">
                {copy.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1f1218] text-[#ff9d66]">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </aside>

      {/* ===== Form (kanan) ===== */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-[26rem]">
          <Reveal>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Sign in</h2>
            <span aria-hidden className="mt-3 block h-1.5 w-14 rounded-full bg-[#ff9d66]" />
            <p className="mt-3 text-[#5d4a52]">Welcome back. Enter your details to continue.</p>
          </Reveal>

          <Reveal delay={150}>
            <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-5">
              {errors.form && (
                <p role="alert" className="flex items-start gap-2 rounded-2xl bg-[#c8362b]/10 px-4 py-3 text-sm font-semibold text-[#9f2a20]">
                  <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
                  {errors.form}
                </p>
              )}

              <Field id="email" label="Email" icon="mail" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  disabled={locked}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`${inputBase} ${errors.email ? inputBad : inputOk}`}
                />
              </Field>

              <Field
                id="password"
                label="Password"
                icon="lock"
                error={errors.password}
                right={
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="grid h-9 w-9 place-items-center rounded-full text-[#5d4a52] transition hover:bg-[#ff9d66]/25 hover:text-[#1f1218]"
                  >
                    <Icon name={show ? "eyeOff" : "eye"} className="h-[18px] w-[18px]" />
                  </button>
                }
              >
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  disabled={locked}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`${inputBase} pr-12 ${errors.password ? inputBad : inputOk}`}
                />
              </Field>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#1f1218]"
                  />
                  Remember me
                </label>
                <Link href={forgotHref} className="font-bold text-[#e8641f] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={locked || busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1f1218] px-8 py-4 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218] disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e7be0]"
              >
                {status === "loading" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in…
                  </>
                ) : status === "success" ? (
                  <>
                    <Icon name="check" className="h-5 w-5" />
                    Success, redirecting…
                  </>
                ) : (
                  <>
                    Sign in
                    <Icon name="arrow" className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </Reveal>

          {showDemoHint && accounts.length > 0 && (
            <Reveal delay={300}>
              <div className="mt-6 rounded-2xl border border-dashed border-[#ff9d66] bg-[#ff9d66]/10 p-4 text-[13px]">
                <p className="font-bold">
                  Demo accounts <span className="font-semibold text-[#5d4a52]">· click one to fill the form</span>
                </p>
                <ul className="mt-3 grid gap-2">
                  {accounts.map((a) => (
                    <li key={a.email}>
                      <button
                        type="button"
                        onClick={() => fillAccount(a)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-left ring-1 ring-[#1f1218]/5 transition-colors duration-200 hover:bg-[#ff9d66]"
                      >
                        <span className="min-w-0 leading-tight">
                          <b className="block truncate">{a.email}</b>
                          <span className="text-[12px] text-[#1f1218]/70">
                            {a.name} · {a.password}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[#1f1218] px-2.5 py-0.5 text-[11px] font-bold text-white">{a.role}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal delay={400}>
            <p className="mt-7 text-center text-sm text-[#5d4a52]">
              Don’t have an account?{" "}
              <Link href={signUpHref} className="font-bold text-[#1f1218] underline decoration-[#ff9d66] decoration-2 underline-offset-4 hover:text-[#e8641f]">
                Sign up
              </Link>
            </p>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
