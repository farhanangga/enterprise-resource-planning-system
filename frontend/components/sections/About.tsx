import { Suspense } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

type AboutItem = {
  icon: IconName;
  title: string;
  text: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: AboutItem[];
};

async function getAbout(): Promise<AboutItem[]> {
  const apiUrl = process.env.API_URL || "http://localhost:3001";
  const apiKey = process.env.API_SECRET_KEY;

  if (!apiKey) {
    throw new Error("API_SECRET_KEY is not configured");
  }

  const response = await fetch(`${apiUrl}/api/about`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch about: ${response.status}`);
  }

  const result: ApiResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

/* Class grid dipakai bersama oleh grid asli dan skeleton
   supaya posisi dan jumlah kolomnya identik. */
const gridClass = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3";

/* =====================================================================
 *  BAGIAN DINAMIS (butuh data API) — di-stream lewat <Suspense>
 * ===================================================================== */

async function AboutGrid() {
  const items = await getAbout();

  return (
    <div className={gridClass}>
      {items.map((f, i) => (
        <Reveal key={f.title} delay={(i % 3) * 120} className="h-full">
          <article className="group relative h-full overflow-hidden rounded-[28px] border border-[#1f1218]/10 bg-[#ff9d66] p-7 text-[#1f1218] shadow-[0_18px_36px_-20px_rgba(255,157,102,.9)] transition-all duration-300 hover:-translate-y-2 hover:border-[#1f1218] hover:bg-[#1f1218] hover:text-white hover:shadow-[0_24px_40px_-20px_rgba(31,18,24,.75)]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#1f1218] text-[#ff9d66] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#ff9d66] group-hover:text-[#1f1218]">
              <Icon name={f.icon} className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#1f1218]/80 transition-colors duration-300 group-hover:text-white/80">
              {f.text}
            </p>
            <Icon
              name="arrow"
              className="absolute right-6 top-6 h-5 w-5 -translate-x-2 -rotate-45 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </article>
        </Reveal>
      ))}
    </div>
  );
}

/* ===== Skeleton ===== */

function AboutCardSkeleton({ index }: { index: number }) {
  const delay = `${(index % 3) * 120}ms`;

  return (
    <div
      className="h-full animate-pulse overflow-hidden rounded-[28px] border border-[#1f1218]/10 bg-[#ff9d66]/40 p-7"
      style={{ animationDelay: delay }}
    >
      {/* ikon */}
      <div className="h-12 w-12 rounded-2xl bg-[#1f1218]/20" />
      {/* judul */}
      <div className="mt-5 h-5 w-3/5 rounded-md bg-[#1f1218]/20" />
      {/* teks (3 baris, yang terakhir lebih pendek) */}
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full rounded-full bg-[#1f1218]/15" />
        <div className="h-3.5 w-[92%] rounded-full bg-[#1f1218]/15" />
        <div className="h-3.5 w-[60%] rounded-full bg-[#1f1218]/15" />
      </div>
    </div>
  );
}

/** Jumlah kartu skeleton: 6 supaya mengisi 2 baris di grid 3 kolom. */
function AboutGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className={gridClass}>
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <AboutCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

/* =====================================================================
 *  ABOUT — sekarang BUKAN async, jadi kerangka langsung tampil
 * ===================================================================== */

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-white px-6 py-20 text-[#1f1218] sm:px-10 lg:px-14 lg:py-28">
      {/* ===== Latar: grid garis kotak ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,18,24,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.07)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_45%,black,transparent)]"
      />
      {/* ===== Latar: blur oranye di sisi kiri ===== */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[12%] h-[28rem] w-[28rem] rounded-full bg-[#ff9d66]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-[6%] h-80 w-80 rounded-full bg-[#ff9d66]/25 blur-3xl" />

      <Container className="relative z-10">
        <SectionHeading
          title="One platform for every team"
          lead="ETERA brings your daily operations into one workspace, so finance, HR, warehouse, and sales always work from the same numbers."
        />

        {/* Hanya grid kartu yang menunggu API */}
        <Suspense fallback={<AboutGridSkeleton />}>
          <AboutGrid />
        </Suspense>
      </Container>
    </section>
  );
}