import { Suspense, cache } from "react";
import Image from "next/image";
import Link from "next/link";
import heroImg from "@/public/assets/hero.png";
import Navbar from "@/components/Navbar";
import { Icon, type IconName } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

type HeroData = {
  id: number;
  title: string[];
  description: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: HeroData;
};

/**
 * Dibungkus cache() supaya kalau dipanggil lebih dari sekali
 * dalam satu render, request ke API tetap hanya sekali.
 */
const getHero = cache(async (): Promise<HeroData> => {
  const apiUrl = process.env.API_URL || "http://localhost:3001";
  const apiKey = process.env.API_SECRET_KEY;

  if (!apiKey) {
    throw new Error("API_SECRET_KEY is not configured");
  }

  const response = await fetch(`${apiUrl}/api/hero`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch hero: ${response.status}`);
  }

  const result: ApiResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
});

/* ===== Data statis ===== */
const cta = { label: "Start Now", href: "/auth/signUp" };

const card =
  "bg-white shadow-[0_18px_40px_-18px_rgba(31,18,24,.35)] ring-1 ring-[#1f1218]/5 transition-transform duration-300 hover:scale-105";

const bars = [38, 55, 44, 70, 62, 86, 100];

// Contoh angka — ganti dengan data asli perusahaan Anda
const stats = [
  { value: "1,200+", label: "Companies" },
  { value: "25K+", label: "Users" },
  { value: "12", label: "Countries" },
];

/* ===== Style tombol (semua ukuran seragam) ===== */
const btnBase =
  "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1218] sm:h-14 sm:w-auto sm:min-w-[11rem] sm:px-8 sm:text-base";

// Coklat -> hover putih
const btnBrown = `${btnBase} bg-[#1f1218] text-white shadow-[0_10px_24px_-8px_rgba(31,18,24,.65)] hover:bg-white hover:text-[#1f1218] hover:shadow-[0_16px_30px_-12px_rgba(31,18,24,.45)]`;

// Putih -> hover coklat
const btnWhite = `${btnBase} bg-white text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(31,18,24,.35)] hover:bg-[#1f1218] hover:text-white hover:shadow-[0_16px_30px_-10px_rgba(31,18,24,.65)]`;

// Sign Up (oranye) -> hover coklat
const btnOrange = `${btnBase} bg-[#ff9d66] text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(255,157,102,.9)] hover:bg-[#1f1218] hover:text-white hover:shadow-[0_16px_30px_-10px_rgba(31,18,24,.6)]`;

// Sign In (coklat gelap) -> hover oranye
const btnDark = `${btnBase} bg-[#1f1218] text-white shadow-[0_10px_24px_-8px_rgba(31,18,24,.65)] hover:bg-[#ff9d66] hover:text-[#1f1218] hover:shadow-[0_16px_30px_-10px_rgba(255,157,102,.9)]`;

// Ukuran font judul dipakai bersama oleh h1 asli dan skeleton-nya
// supaya tinggi keduanya sama dan layout tidak melompat.
const titleSize =
  "text-[clamp(2.2rem,min(5.4vw,10vh),4.75rem)] font-black uppercase leading-[1.02] tracking-tight";

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

/** Kartu kecil melayang di dekat ilustrasi (tampil di semua ukuran layar) */
function Chip({
  icon,
  title,
  sub,
  className,
  delay,
}: {
  icon: IconName;
  title: string;
  sub: string;
  className: string;
  delay: string;
}) {
  return (
    <div className={`etera-float absolute z-20 block whitespace-nowrap ${className}`} style={{ animationDelay: delay }}>
      <div className={`flex origin-center scale-[.78] items-center gap-3 rounded-2xl px-4 py-3 text-[#1f1218] sm:scale-90 md:scale-100 ${card}`}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ff9d66]">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <b className="block text-[13px]">{title}</b>
          <span className="text-[11px] text-[#5d4a52]">{sub}</span>
        </span>
      </div>
    </div>
  );
}

function Pill({ icon, label, className, delay }: { icon: IconName; label: string; className: string; delay: string }) {
  return (
    <div className={`etera-float ${className}`} style={{ animationDelay: delay }}>
      <span className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-xs font-bold text-[#1f1218] ${card}`}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#ff9d66]">
          <Icon name={icon} className="h-3.5 w-3.5" />
        </span>
        {label}
      </span>
    </div>
  );
}

/** Tiga pill modul, tersusun ke bawah (sama di mobile dan desktop) */
function Modules() {
  return (
    <>
      <Pill icon="finance" label="Finance" className="" delay="0s" />
      <Pill icon="hr" label="HR" className="ml-8 mt-3" delay="-1.5s" />
      <Pill icon="inventory" label="Inventory" className="ml-2 mt-3" delay="-3s" />
    </>
  );
}

/** Kartu mini grafik revenue */
function RevenueCard({ className = "" }: { className?: string }) {
  return (
    <div className={`w-40 rounded-2xl p-3.5 text-[#1f1218] ${card} ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#5d4a52]">
        <span>Revenue</span>
        <span className="rounded-full bg-[#ff9d66]/25 px-2 py-0.5 text-[10px] font-bold text-[#1f1218]">This week</span>
      </div>
      <p className="mt-1.5 text-lg font-black leading-none">Rp 48,2 jt</p>
      <div className="mt-3 flex h-12 items-end gap-1" aria-hidden>
        {bars.map((h, i) => (
          <span
            key={i}
            className={`etera-grow flex-1 rounded-sm ${i === bars.length - 1 ? "bg-[#1f1218]" : "bg-[#ff9d66]"}`}
            style={{ height: `${h}%`, animationDelay: `${1.1 + i * 0.08}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
 *  BAGIAN DINAMIS (butuh data API) — di-stream lewat <Suspense>
 * ===================================================================== */

/** Judul + deskripsi. Async server component: inilah yang "menunggu" API. */
async function HeroCopy() {
  const heroApi = await getHero();

  return (
    <>
      {/* Hover: tiap huruf terangkat dan berubah putih */}
      <h1 aria-label={heroApi.title.join(" ")} className={titleSize}>
        {heroApi.title.map((line, i) => (
          <span key={line} aria-hidden className="-mt-[0.2em] block overflow-hidden pb-[0.04em] pt-[0.2em]">
            <Reveal as="span" variant="mask" delay={100 + i * 130} duration={900} className="block">
              {line.split("").map((ch, j) =>
                ch === " " ? (
                  <span key={j} className="inline-block w-[0.28em]" />
                ) : (
                  <span
                    key={j}
                    className="inline-block cursor-default transition-all duration-300 ease-out hover:-translate-y-[0.12em] hover:scale-110 hover:text-white"
                  >
                    {ch}
                  </span>
                ),
              )}
            </Reveal>
          </span>
        ))}
      </h1>

      <Reveal delay={450}>
        <p className="mt-4 max-w-[36rem] text-sm font-semibold leading-relaxed text-white sm:text-base lg:text-[15px]">
          {heroApi.description}
        </p>
      </Reveal>
    </>
  );
}

/** Skeleton yang ukurannya meniru judul + deskripsi asli. */
function HeroCopySkeleton() {
  const titleLines = ["w-[88%]", "w-[64%]", "w-[76%]"];
  const descLines = ["w-full", "w-[92%]", "w-[60%]"];

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>

      <div aria-hidden className={titleSize}>
        {titleLines.map((w, i) => (
          <span key={i} className="-mt-[0.2em] block pb-[0.04em] pt-[0.2em]">
            <span
              className={`block h-[0.82em] animate-pulse rounded-xl bg-[#1f1218]/15 ${w}`}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          </span>
        ))}
      </div>

      <div aria-hidden className="mt-4 max-w-[36rem] space-y-2.5">
        {descLines.map((w, i) => (
          <span
            key={i}
            className={`block h-3.5 animate-pulse rounded-full bg-white/50 sm:h-4 lg:h-[15px] ${w}`}
            style={{ animationDelay: `${300 + i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* =====================================================================
 *  HERO — sekarang BUKAN async, jadi kerangka halaman langsung tampil
 * ===================================================================== */

export default function Hero() {
  return (
    // Satu latar putih untuk seluruh hero (kiri + kanan), supaya menyatu
    <header id="home" className="relative grid overflow-hidden bg-white lg:h-[100svh] lg:max-h-[880px] lg:min-h-[600px] lg:grid-cols-[3fr_2fr]">
      <style>{`
        @keyframes etera-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes etera-spin{to{transform:rotate(360deg)}}
        @keyframes etera-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,-18px)}}
        @keyframes etera-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        .etera-float{animation:etera-float 6s ease-in-out infinite}
        .etera-spin{animation:etera-spin 60s linear infinite}
        .etera-drift{animation:etera-drift 9s ease-in-out infinite}
        .etera-grow{transform-origin:bottom;animation:etera-grow .9s cubic-bezier(.22,1,.36,1) both}
        @media (prefers-reduced-motion:reduce){.etera-float,.etera-spin,.etera-drift,.etera-grow{animation:none!important}}
      `}</style>

      {/* ===== Latar bersama (melintasi kiri dan kanan) ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,18,24,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_85%_80%_at_72%_55%,black,transparent)]"
      />
      {/* pudar ke putih di dasar agar menyatu dengan section berikutnya */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-white to-transparent" />

      {/* ===== Panel oranye (kiri) ===== */}
      <div className="relative z-10 flex flex-col overflow-hidden rounded-b-[28px] bg-gradient-to-br from-[#ffb184] via-[#ff9d66] to-[#f27f45] px-5 pb-8 pt-5 text-[#1f1218] sm:rounded-b-[32px] sm:px-10 lg:mb-10 lg:rounded-b-none lg:rounded-br-[44px] lg:px-14 lg:pt-7">
        {/* dekorasi panel: lingkaran gradasi gelap */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-[#1f1218]/45 via-[#1f1218]/15 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-44 left-[22%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-[#3b1d12]/50 via-[#1f1218]/15 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-[38%] h-64 w-64 rounded-full bg-gradient-to-br from-[#1f1218]/25 to-transparent"
        />
        {/* ring tipis */}
        <div aria-hidden className="pointer-events-none absolute -right-10 top-[14%] h-56 w-56 rounded-full border border-[#1f1218]/25" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-[6%] h-80 w-80 rounded-full border border-[#1f1218]/10" />

        <div className="relative z-10 flex flex-1 flex-col">
          <Navbar />

          <div className="my-auto pt-8 lg:py-3">
            {/* Hanya judul + deskripsi yang menunggu API */}
            <Suspense fallback={<HeroCopySkeleton />}>
              <HeroCopy />
            </Suspense>

            {/* CTA: 2 kolom sama lebar di mobile, berdampingan di layar lebih besar */}
            <Reveal delay={600} className="mt-6 grid max-w-[34rem] grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
              <Link href={cta.href} className={btnBrown}>
                {cta.label}
                <Arrow />
              </Link>
              <Link href="#about" className={btnWhite}>
                See features
              </Link>
            </Reveal>

            {/* statistik */}
            <Reveal delay={800} className="mt-6 max-w-[36rem] lg:[@media(max-height:620px)]:hidden">
              <dl className="grid grid-cols-3 divide-x divide-[#1f1218]/10 rounded-2xl bg-white py-4 shadow-[0_16px_32px_-14px_rgba(31,18,24,.45)] ring-1 ring-[#1f1218]/5 sm:py-5">
                {stats.map((s) => (
                  <div key={s.label} className="px-2 text-center transition-transform duration-300 hover:-translate-y-0.5 sm:px-5">
                    <dt className="text-2xl font-black leading-none tracking-tight sm:text-3xl">{s.value}</dt>
                    <dd className="mt-1.5 text-xs font-semibold text-[#5d4a52]">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ===== Kolom kanan (tanpa latar sendiri, memakai latar bersama) ===== */}
      <div className="relative flex flex-col items-center px-5 pb-12 pt-7 sm:px-10 lg:px-10 lg:pb-0 lg:pt-7">
        {/* blur hangat */}
        <div aria-hidden className="etera-drift pointer-events-none absolute -right-24 top-[22%] h-72 w-72 rounded-full bg-[#ff9d66]/30 blur-3xl" />
        {/* busur sudut kanan-atas */}
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full border-[16px] border-[#ff9d66]/25" />
        {/* cincin konsentris di belakang arch */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[66%] flex h-0 items-center justify-center">
          <div className="etera-spin h-[min(520px,74vh)] w-[min(520px,74vh)] shrink-0 rounded-full border-2 border-dashed border-[#ff9d66]/60" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[66%] flex h-0 items-center justify-center">
          <div className="h-[min(380px,56vh)] w-[min(380px,56vh)] shrink-0 rounded-full border border-[#1f1218]/10" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[66%] flex h-0 items-center justify-center">
          <div className="h-[min(660px,92vh)] w-[min(660px,92vh)] shrink-0 rounded-full border border-[#ff9d66]/25" />
        </div>

        {/* ===== Tombol auth: 2 kolom sama lebar di mobile ===== */}
        <Reveal variant="down" delay={300} className="relative z-10 grid w-full max-w-[34rem] grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-none sm:justify-center sm:gap-4">
          <Link href="/auth/signUp" className={btnOrange}>
            Sign Up
          </Link>
          <Link href="/auth/signIn" className={btnDark}>
            Sign In
          </Link>
        </Reveal>

        {/* ===== Tablet dan layar >= 1280px: melayang di kiri dan kanan ===== */}
        <div className="absolute left-5 top-[19%] z-10 hidden md:block lg:hidden xl:block">
          <Modules />
        </div>
        <div className="etera-float absolute right-5 top-[17%] z-10 hidden md:block lg:hidden xl:block" style={{ animationDelay: "-2s" }}>
          <RevenueCard />
        </div>

        <Reveal variant="rise" duration={1100} delay={450} className="group relative z-10 mt-20 w-[min(86%,440px)] sm:mt-24 sm:w-[min(72%,480px)] md:mt-14 lg:mt-auto lg:w-[min(86%,560px,56vh)]">
          {/* Div coklat (arch) di belakang hero.png */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[58%] w-[108%] -translate-x-1/2 origin-bottom rounded-[36px] bg-[#1f1218] transition-transform duration-700 ease-out group-hover:scale-y-105 sm:w-[112%] sm:rounded-[44px]"
          />

          {/* Mobile: modul dan Revenue di belakang hero.png (z-[1] < gambar z-10) */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-12 z-[1] md:hidden">
            <div className="absolute -left-4 top-0">
              <Modules />
            </div>
            <div className="etera-float absolute -right-4 top-3" style={{ animationDelay: "-2s" }}>
              <RevenueCard className="origin-top-right scale-[.72]" />
            </div>
          </div>

          <Image
            src={heroImg}
            alt="Business owner using a tablet to manage the company with ETERA"
            priority
            sizes="(min-width: 1024px) 560px, 80vw"
            className="relative z-10 h-auto w-full origin-bottom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          <Chip icon="finance" title="Invoice paid" sub="Rp 12.500.000" className="-left-5 top-[42%] sm:-left-8 sm:top-[34%] lg:-left-12" delay="0s" />
          <Chip icon="inventory" title="Stock synced" sub="All warehouses" className="-right-5 bottom-[12%] sm:-right-6 sm:bottom-[20%] lg:-right-10" delay="-3s" />
        </Reveal>
      </div>
    </header>
  );
}