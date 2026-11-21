import Image from "next/image";
import heroImg from "@/public/assets/hero.png";
import { hero } from "@/lib/content";
import Navbar from "@/components/Navbar";
import Button from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

// Elemen tambahan hanya tampil saat kolom kanan cukup lebar (tablet, dan layar >= 1280px)
const extras = "hidden md:block lg:hidden xl:block";
const card =
  "bg-white shadow-[0_18px_40px_-18px_rgba(31,18,24,.35)] ring-1 ring-[#1f1218]/5 transition-transform duration-300 hover:scale-105";

const bars = [38, 55, 44, 70, 62, 86, 100];

/** Kartu kecil melayang di dekat ilustrasi */
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
    <div className={`etera-float absolute z-20 hidden whitespace-nowrap sm:block ${className}`} style={{ animationDelay: delay }}>
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[#1f1218] ${card}`}>
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

export default function Hero() {
  return (
    <header id="home" className="grid lg:min-h-[680px] lg:grid-cols-[3fr_2fr]">
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

      {/* Panel oranye (kiri) */}
      <div className="flex flex-col rounded-br-[32px] bg-[#ff9d66] px-6 pb-14 pt-6 text-[#1f1218] sm:px-10 lg:mb-14 lg:rounded-br-[44px] lg:px-14 lg:pt-7">
        <Navbar />

        <div className="my-auto py-14 lg:py-12">
          {/* Hover: tiap huruf terangkat dan berubah putih */}
          <h1
            aria-label={hero.lines.join(" ")}
            className="text-[clamp(2.4rem,5.4vw,4.75rem)] font-black uppercase leading-[1.02] tracking-tight"
          >
            {hero.lines.map((line, i) => (
              <span key={line} aria-hidden className="-mt-[0.2em] block overflow-hidden pb-[0.04em] pt-[0.2em]">
                <Reveal as="span" variant="mask" delay={200 + i * 130} duration={900} className="block">
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

          <Reveal delay={650}>
            <p className="mt-6 max-w-[34rem] text-[15px] font-semibold leading-relaxed text-white sm:text-base">{hero.text}</p>
          </Reveal>

          <Reveal delay={800} className="mt-8">
            <Button href={hero.cta.href} variant="mauve" size="lg" arrow>
              {hero.cta.label}
            </Button>
          </Reveal>
        </div>
      </div>

      {/* Kolom putih (kanan) */}
      <div className="relative flex flex-col items-center overflow-hidden bg-white px-6 pt-6 lg:px-10 lg:pt-7">
        {/* ===== Lapisan latar ===== */}
        {/* grid garis tipis + titik, memudar ke tepi */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,18,24,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_55%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,157,102,.55)_1.6px,transparent_1.6px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_72%,black,transparent)]"
        />
        {/* blur hangat */}
        <div aria-hidden className="etera-drift pointer-events-none absolute -right-24 top-[22%] h-72 w-72 rounded-full bg-[#ff9d66]/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 bottom-[8%] h-56 w-56 rounded-full bg-[#1f1218]/10 blur-3xl" />
        {/* busur sudut kanan-atas */}
        <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full border-[16px] border-[#ff9d66]/25" />
        {/* cincin konsentris di belakang arch */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[66%] flex h-0 items-center justify-center">
          <div className="etera-spin h-[460px] w-[460px] shrink-0 rounded-full border-2 border-dashed border-[#ff9d66]/60" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[66%] flex h-0 items-center justify-center">
          <div className="h-[340px] w-[340px] shrink-0 rounded-full border border-[#1f1218]/10" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[66%] flex h-0 items-center justify-center">
          <div className="h-[600px] w-[600px] shrink-0 rounded-full border border-[#ff9d66]/25" />
        </div>
        {/* bentuk kecil */}
        <span aria-hidden className="etera-float pointer-events-none absolute bottom-[12%] left-[7%] h-14 w-14 rotate-12 rounded-2xl border-2 border-[#ff9d66]/70" />
        <span aria-hidden className="etera-float pointer-events-none absolute right-[8%] top-[58%] h-5 w-5 rotate-12 rounded-md bg-[#1f1218]" style={{ animationDelay: "-2s" }} />
        <span aria-hidden className="etera-float pointer-events-none absolute left-[12%] top-[17%] h-3 w-3 rounded-full bg-[#ff9d66]" style={{ animationDelay: "-4s" }} />
        <span aria-hidden className="pointer-events-none absolute left-[46%] top-[17%] text-xl font-black leading-none text-[#ff9d66]">+</span>
        <span aria-hidden className="pointer-events-none absolute bottom-[34%] right-[6%] text-xl font-black leading-none text-[#1f1218]/40">+</span>
        <span aria-hidden className="pointer-events-none absolute bottom-[26%] left-[5%] text-lg font-black leading-none text-[#1f1218]/30">+</span>

        {/* ===== Konten ===== */}
        <Reveal variant="down" delay={300} className="relative z-10 flex flex-wrap justify-center gap-3 sm:gap-4">
          <Button href="/signup" variant="orange" className="min-w-[8.5rem]">
            Sign Up
          </Button>
          <Button href="/signin" variant="dark" className="min-w-[8.5rem]">
            Sign In
          </Button>
        </Reveal>

        {/* modul (kiri) */}
        <div className={`absolute left-5 top-[19%] z-10 ${extras}`}>
          <Pill icon="finance" label="Finance" className="" delay="0s" />
          <Pill icon="hr" label="HR" className="ml-8 mt-3" delay="-1.5s" />
          <Pill icon="inventory" label="Inventory" className="ml-2 mt-3" delay="-3s" />
        </div>

        {/* mini grafik (kanan) */}
        <div className={`etera-float absolute right-5 top-[17%] z-10 ${extras}`} style={{ animationDelay: "-2s" }}>
          <div className={`w-40 rounded-2xl p-3.5 text-[#1f1218] ${card}`}>
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
        </div>

        <Reveal variant="rise" duration={1100} delay={450} className="group relative z-10 mt-12 w-[72%] max-w-[440px] lg:mt-auto">
          {/* Div coklat (arch) di belakang hero.png */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[58%] w-[112%] -translate-x-1/2 origin-bottom rounded-t-[44px] bg-[#1f1218] transition-transform duration-700 ease-out group-hover:scale-y-105"
          />
          <Image
            src={heroImg}
            alt="Business owner using a tablet to manage the company with ETERA"
            priority
            sizes="(min-width: 1024px) 440px, 72vw"
            className="relative z-10 h-auto w-full origin-bottom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          <Chip icon="finance" title="Invoice paid" sub="Rp 12.500.000" className="-left-8 top-[34%] lg:-left-12" delay="0s" />
          <Chip icon="inventory" title="Stock synced" sub="All warehouses" className="-right-6 bottom-[20%] lg:-right-10" delay="-3s" />
        </Reveal>
      </div>
    </header>
  );
}