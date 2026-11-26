import { Suspense } from "react";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

type StepsItem = {
  title: string;
  text: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: StepsItem[];
};

async function getSteps(): Promise<StepsItem[]> {
  const apiUrl = process.env.API_URL || "http://localhost:3001";
  const apiKey = process.env.API_SECRET_KEY;

  if (!apiKey) {
    throw new Error("API_SECRET_KEY is not configured");
  }

  const response = await fetch(`${apiUrl}/api/steps`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch steps: ${response.status}`);
  }

  const result: ApiResponse = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

/* Class list dipakai bersama oleh list asli dan skeleton
   supaya posisi dan jumlah kolomnya identik. */
const listClass = "grid gap-5 md:grid-cols-3";

/* =====================================================================
 *  BAGIAN DINAMIS (butuh data API) — di-stream lewat <Suspense>
 * ===================================================================== */

async function StepsList() {
  const items = await getSteps();

  return (
    <ol className={listClass}>
      {items.map((s, i) => (
        <Reveal as="li" key={s.title} delay={i * 150} className="h-full">
          <div className="group h-full rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-[0_18px_36px_-20px_rgba(0,0,0,.6)] transition-all duration-300 hover:-translate-y-2 hover:border-[#ff9d66] hover:bg-[#ff9d66] hover:text-[#1f1218] hover:shadow-[0_24px_40px_-20px_rgba(255,157,102,.7)]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ff9d66] text-lg font-black text-[#1f1218] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-[#1f1218] group-hover:text-[#ff9d66]">
              {i + 1}
            </span>
            <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#e3cdd4] transition-colors duration-300 group-hover:text-[#1f1218]/80">
              {s.text}
            </p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

/* ===== Skeleton ===== */

function StepCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="h-full animate-pulse rounded-[28px] border border-white/10 bg-white/5 p-7"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* lingkaran nomor */}
      <div className="h-11 w-11 rounded-full bg-[#ff9d66]/40" />
      {/* judul */}
      <div className="mt-5 h-5 w-3/5 rounded-md bg-white/20" />
      {/* teks (3 baris, yang terakhir lebih pendek) */}
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-full rounded-full bg-white/10" />
        <div className="h-3.5 w-[92%] rounded-full bg-white/10" />
        <div className="h-3.5 w-[60%] rounded-full bg-white/10" />
      </div>
    </div>
  );
}

/** Default 3 kartu, sesuai grid md:grid-cols-3. */
function StepsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className={listClass}>
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <StepCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}

/* =====================================================================
 *  STEPS — sekarang BUKAN async, jadi kerangka langsung tampil
 * ===================================================================== */

export default function Steps() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#1f1218] px-6 py-20 text-white sm:px-10 lg:px-14 lg:py-28"
    >
      {/* ===== Latar: grid garis kotak ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_45%,black,transparent)]"
      />
      {/* ===== Latar: blur oranye (kiri atas dan kanan bawah) ===== */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[8%] h-[28rem] w-[28rem] rounded-full bg-[#ff9d66]/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#ff9d66]/20 blur-3xl" />

      <Container className="relative z-10">
        <SectionHeading
          light
          title="Up and running in minutes"
          lead="No long implementation. Create your workspace, add your data, and start working."
        />

        {/* Hanya daftar langkah yang menunggu API */}
        <Suspense fallback={<StepsListSkeleton />}>
          <StepsList />
        </Suspense>
      </Container>
    </section>
  );
}