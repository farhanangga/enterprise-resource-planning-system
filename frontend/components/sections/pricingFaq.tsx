import { Suspense, cache } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

/* ===== Types ===== */
type PlanTone = "white" | "orange" | "brown";

type PlanItem = {
  name: string;
  price: string;
  suffix: string;
  text: string;
  items: string[];
  cta: string;
  href: string;
  tone: PlanTone;
};

type FaqItem = {
  q: string;
  a: string;
};

type PricingFaqData = {
  plans: PlanItem[];
  faqs: FaqItem[];
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: PricingFaqData;
};

/* ===== Satu jalur API (di-cache, hanya 1 request per render) ===== */
const getPricingFaq = cache(async (): Promise<PricingFaqData> => {
  const apiUrl = process.env.API_URL || "http://localhost:3001";
  const apiKey = process.env.API_SECRET_KEY;

  if (!apiKey) {
    throw new Error("API_SECRET_KEY is not configured");
  }

  const response = await fetch(`${apiUrl}/api/pricingFaq`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pricing-faq: ${response.status}`);
  }

  const result: ApiResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
});

/* ===== Data statis CTA ===== */
const cta = { label: "Start Now", href: "/auth/signUp" };

/* ===== Warna kartu pricing: putih (Starter), oranye (Business), coklat (Enterprise) ===== */
const tones = {
  white: {
    card: "border-[#1f1218]/10 bg-white text-[#1f1218] shadow-[0_18px_36px_-24px_rgba(31,18,24,.35)] hover:border-[#ff9d66] hover:shadow-[0_28px_48px_-24px_rgba(31,18,24,.45)]",
    muted: "text-[#5d4a52]",
    check: "bg-[#ff9d66] text-[#1f1218]",
    button: "bg-[#1f1218] text-white hover:bg-[#ff9d66] hover:text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(31,18,24,.6)]",
  },
  orange: {
    card: "border-[#ff9d66] bg-[#ff9d66] text-[#1f1218] shadow-[0_24px_44px_-22px_rgba(255,157,102,.9)] hover:shadow-[0_32px_56px_-22px_rgba(255,157,102,1)]",
    muted: "text-[#1f1218]/80",
    check: "bg-[#1f1218] text-[#ff9d66]",
    button: "bg-white text-[#1f1218] hover:bg-[#1f1218] hover:text-white shadow-[0_10px_24px_-10px_rgba(31,18,24,.4)]",
  },
  brown: {
    card: "border-[#1f1218] bg-[#1f1218] text-white shadow-[0_18px_36px_-24px_rgba(31,18,24,.6)] hover:shadow-[0_28px_50px_-24px_rgba(31,18,24,.8)]",
    muted: "text-[#e3cdd4]",
    check: "bg-[#ff9d66] text-[#1f1218]",
    button: "bg-[#ff9d66] text-[#1f1218] hover:bg-white hover:text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(255,157,102,.8)]",
  },
} as const;

/* ===== Tombol seragam ===== */
const btnBase =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1218] sm:h-14 sm:px-8 sm:text-base";

/* Class dipakai bersama oleh konten asli dan skeleton */
const plansGrid = "grid items-stretch gap-5 md:grid-cols-3 md:gap-6";

function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* =====================================================================
 *  BAGIAN DINAMIS (butuh data API) — di-stream lewat <Suspense>
 * ===================================================================== */

async function PlansGrid() {
  const { plans } = await getPricingFaq();

  return (
    <div className={plansGrid}>
      {plans.map((p, i) => {
        const t = tones[p.tone] ?? tones.white;
        const featured = p.tone === "orange";
        return (
          <Reveal key={p.name} delay={i * 130} className="h-full">
            <article
              className={`relative flex h-full flex-col rounded-[28px] border p-7 transition-all duration-300 hover:-translate-y-2 sm:p-8 ${
                featured ? "md:py-10" : ""
              } ${t.card}`}
            >
              <div className="flex min-h-[1.75rem] items-center justify-between gap-3">
                <h3 className="text-lg font-bold">{p.name}</h3>
                {featured && (
                  <span className="shrink-0 rounded-full bg-[#1f1218] px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight sm:text-5xl">{p.price}</span>
                {p.suffix && <span className={`text-sm font-semibold ${t.muted}`}>{p.suffix}</span>}
              </div>
              <p className={`mt-2 text-[15px] ${t.muted}`}>{p.text}</p>

              <div className="my-6 h-px w-full bg-current opacity-10" />

              <ul className="grid gap-3.5 text-[15px]">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${t.check}`}>
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Link href={p.href} className={`${btnBase} w-full ${t.button}`}>
                  {p.cta}
                </Link>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

/**
 * FAQ memakai <details name="faq"> (accordion native, eksklusif: hanya 1 terbuka).
 * Tidak butuh useState, jadi halaman tetap server component.
 */
async function FaqList() {
  const { faqs } = await getPricingFaq();

  return (
    <div className="grid gap-3">
      {faqs.map((f, i) => (
        <Reveal key={f.q} delay={i * 90}>
          <details
            name="faq"
            open={i === 0}
            className="group/faq overflow-hidden rounded-[24px] border border-[#1f1218]/10 bg-[#ff9d66] text-[#1f1218] shadow-[0_18px_36px_-22px_rgba(255,157,102,.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1f1218] hover:bg-[#1f1218] hover:text-white open:border-[#1f1218] open:bg-[#1f1218] open:text-white open:shadow-[0_24px_40px_-22px_rgba(31,18,24,.7)]"
          >
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#ff9d66] sm:text-lg [&::-webkit-details-marker]:hidden">
              <span>{f.q}</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1f1218] text-[#ff9d66] transition-all duration-300 group-hover/faq:scale-110 group-hover/faq:bg-[#ff9d66] group-hover/faq:text-[#1f1218] group-open/faq:rotate-45 group-open/faq:bg-[#ff9d66] group-open/faq:text-[#1f1218]">
                <Icon name="plus" className="h-4 w-4" />
              </span>
            </summary>
            <p className="max-w-[42rem] px-6 pb-6 leading-relaxed text-[#e3cdd4]">{f.a}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

/* ===== Skeleton ===== */

function PlanCardSkeleton({ index }: { index: number }) {
  const featured = index === 1;
  return (
    <div
      className={`flex h-full animate-pulse flex-col rounded-[28px] border border-[#1f1218]/10 bg-[#1f1218]/5 p-7 sm:p-8 ${
        featured ? "md:py-10" : ""
      }`}
      style={{ animationDelay: `${index * 130}ms` }}
    >
      <div className="h-6 w-2/5 rounded-md bg-[#1f1218]/15" />
      <div className="mt-4 h-10 w-1/2 rounded-md bg-[#1f1218]/20 sm:h-12" />
      <div className="mt-3 h-4 w-3/4 rounded-full bg-[#1f1218]/10" />

      <div className="my-6 h-px w-full bg-[#1f1218]/10" />

      <div className="grid gap-3.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="h-5 w-5 shrink-0 rounded-full bg-[#1f1218]/15" />
            <span className="h-4 w-4/5 rounded-full bg-[#1f1218]/10" />
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <div className="h-12 w-full rounded-full bg-[#1f1218]/15 sm:h-14" />
      </div>
    </div>
  );
}

function PlansGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className={plansGrid}>
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <PlanCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

function FaqListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className="grid gap-3">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-[68px] animate-pulse items-center justify-between gap-4 rounded-[24px] border border-[#1f1218]/10 bg-[#ff9d66]/40 px-6 sm:h-[76px]"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <span className="h-4 w-3/5 rounded-full bg-[#1f1218]/20" />
          <span className="h-8 w-8 shrink-0 rounded-full bg-[#1f1218]/25" />
        </div>
      ))}
    </div>
  );
}

/* =====================================================================
 *  PRICING + FAQ — BUKAN async, kerangka langsung tampil
 * ===================================================================== */

export default function PricingFaq() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-20 text-[#1f1218] sm:px-10 lg:px-14 lg:py-28">
      {/* ===== Latar: grid garis kotak ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,18,24,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.07)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_85%_at_50%_50%,black,transparent)]"
      />
      {/* ===== Latar: blur oranye (kanan atas, kiri tengah, kanan bawah) ===== */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-[4%] h-[28rem] w-[28rem] rounded-full bg-[#ff9d66]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[48%] h-[26rem] w-[26rem] rounded-full bg-[#ff9d66]/35 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-[2%] h-80 w-80 rounded-full bg-[#ff9d66]/25 blur-3xl" />

      <Container className="relative z-10">
        {/* ================= PRICING ================= */}
        <div id="pricing" className="scroll-mt-24">
          <SectionHeading title="Simple pricing" lead="Start free. Upgrade when your company grows." />
          <Suspense fallback={<PlansGridSkeleton />}>
            <PlansGrid />
          </Suspense>
        </div>

        {/* ================= FAQ ================= */}
        <div id="faq" className="mt-20 grid scroll-mt-24 gap-4 sm:mt-24 lg:mt-28 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
          <SectionHeading title="Questions" lead="Quick answers about getting started with ETERA." />
          <Suspense fallback={<FaqListSkeleton />}>
            <FaqList />
          </Suspense>
        </div>

        {/* ================= CTA ================= */}
        <Reveal variant="scale" duration={900} className="mt-20 sm:mt-24 lg:mt-28">
          <div className="relative overflow-hidden rounded-[36px] rounded-br-[64px] bg-gradient-to-br from-[#ffb184] via-[#ff9d66] to-[#f27f45] px-8 py-12 text-[#1f1218] shadow-[0_28px_50px_-26px_rgba(255,157,102,.95)] sm:px-14 sm:py-16">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-[#1f1218]/45 via-[#1f1218]/15 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 left-[30%] h-72 w-72 rounded-full bg-gradient-to-tr from-[#3b1d12]/40 via-[#1f1218]/10 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute -right-8 top-[18%] h-48 w-48 rounded-full border border-[#1f1218]/20" />

            <div className="relative flex flex-wrap items-center justify-between gap-8">
              <h2 className="max-w-[30rem] text-[clamp(1.75rem,3.8vw,2.75rem)] font-black uppercase leading-[1.05] tracking-tight">
                Ready to manage your company more easily?
              </h2>
              <Link
                href={cta.href}
                className={`${btnBase} w-full bg-[#1f1218] text-white shadow-[0_10px_24px_-8px_rgba(31,18,24,.65)] hover:bg-white hover:text-[#1f1218] sm:w-auto sm:min-w-[11rem]`}
              >
                {cta.label}
                <Arrow />
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}