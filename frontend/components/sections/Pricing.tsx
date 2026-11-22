import Link from "next/link";
import { plans } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

// Komposisi warna: putih (Starter), oranye (Business), coklat (Enterprise)
const tones = {
  white: {
    card: "border-[#1f1218]/10 bg-white text-[#1f1218] shadow-[0_18px_36px_-24px_rgba(31,18,24,.35)] hover:border-[#ff9d66] hover:shadow-[0_28px_48px_-24px_rgba(31,18,24,.45)]",
    muted: "text-[#5d4a52]",
    check: "bg-[#ff9d66] text-[#1f1218]",
    button:
      "bg-[#1f1218] text-white hover:bg-[#ff9d66] hover:text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(31,18,24,.6)]",
  },
  orange: {
    card: "border-[#ff9d66] bg-[#ff9d66] text-[#1f1218] shadow-[0_24px_44px_-22px_rgba(255,157,102,.9)] hover:shadow-[0_32px_56px_-22px_rgba(255,157,102,1)]",
    muted: "text-[#1f1218]/80",
    check: "bg-[#1f1218] text-[#ff9d66]",
    button:
      "bg-white text-[#1f1218] hover:bg-[#1f1218] hover:text-white shadow-[0_10px_24px_-10px_rgba(31,18,24,.4)]",
  },
  brown: {
    card: "border-[#1f1218] bg-[#1f1218] text-white shadow-[0_18px_36px_-24px_rgba(31,18,24,.6)] hover:shadow-[0_28px_50px_-24px_rgba(31,18,24,.8)]",
    muted: "text-[#e3cdd4]",
    check: "bg-[#ff9d66] text-[#1f1218]",
    button:
      "bg-[#ff9d66] text-[#1f1218] hover:bg-white hover:text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(255,157,102,.8)]",
  },
} as const;

const btnBase =
  "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f1218] sm:h-14 sm:text-base";

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-white px-6 py-20 text-[#1f1218] sm:px-10 lg:px-14 lg:py-28">
      {/* ===== Latar: grid garis kotak ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,18,24,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.07)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_45%,black,transparent)]"
      />
      {/* ===== Latar: blur oranye di sisi kanan ===== */}
      <div aria-hidden className="pointer-events-none absolute -right-40 top-[10%] h-[28rem] w-[28rem] rounded-full bg-[#ff9d66]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-[4%] h-80 w-80 rounded-full bg-[#ff9d66]/25 blur-3xl" />

      <Container className="relative z-10">
        <SectionHeading title="Simple pricing" lead="Start free. Upgrade when your company grows." />
        <div className="grid items-stretch gap-5 md:grid-cols-3 md:gap-6">
          {plans.map((p, i) => {
            const t = tones[p.tone];
            const featured = p.tone === "orange";
            return (
              <Reveal key={p.name} delay={i * 130} className="h-full">
                <article
                  className={`relative flex h-full flex-col rounded-[28px] border p-7 transition-all duration-300 hover:-translate-y-2 sm:p-8 ${
                    featured ? "md:py-10" : ""
                  } ${t.card}`}
                >
                  {/* Nama paket + badge */}
                  <div className="flex min-h-[1.75rem] items-center justify-between gap-3">
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    {featured && (
                      <span className="shrink-0 rounded-full bg-[#1f1218] px-3 py-1 text-xs font-semibold text-white">
                        Most popular
                      </span>
                    )}
                  </div>

                  {/* Harga */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight sm:text-5xl">{p.price}</span>
                    {p.suffix && <span className={`text-sm font-semibold ${t.muted}`}>{p.suffix}</span>}
                  </div>
                  <p className={`mt-2 text-[15px] ${t.muted}`}>{p.text}</p>

                  <div className="my-6 h-px w-full bg-current opacity-10" />

                  {/* Fitur */}
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

                  {/* CTA */}
                  <div className="mt-auto pt-8">
                    <Link href={p.href} className={`${btnBase} ${t.button}`}>
                      {p.cta}
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}