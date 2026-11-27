import { plans } from "@/lib/content";
import Button from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

// Komposisi warna: putih (Starter), oranye (Business), coklat (Enterprise)
const tones = {
  white: {
    card: "border-[#1f1218]/10 bg-white text-[#1f1218] shadow-sm hover:border-[#ff9d66] hover:shadow-[0_24px_44px_-24px_rgba(31,18,24,.4)]",
    muted: "text-[#5d4a52]",
    check: "bg-[#ff9d66] text-[#1f1218]",
    button: "dark",
  },
  orange: {
    card: "border-[#ff9d66] bg-[#ff9d66] text-[#1f1218] hover:shadow-[0_28px_50px_-22px_rgba(255,157,102,.95)]",
    muted: "text-[#1f1218]/80",
    check: "bg-[#1f1218] text-[#ff9d66]",
    button: "light",
  },
  brown: {
    card: "border-[#1f1218] bg-[#1f1218] text-white hover:shadow-[0_28px_50px_-24px_rgba(31,18,24,.7)]",
    muted: "text-[#e3cdd4]",
    check: "bg-[#ff9d66] text-[#1f1218]",
    button: "accent",
  },
} as const;

export default function Pricing() {
  return (
    <section id="pricing" className="px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
      <Container>
        <SectionHeading title="Simple pricing" lead="Start free. Upgrade when your company grows." />
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p, i) => {
            const t = tones[p.tone];
            return (
              <Reveal key={p.name} delay={i * 130} className="h-full">
                <article
                  className={`relative flex h-full flex-col rounded-[28px] border p-8 transition-all duration-300 hover:-translate-y-2 ${t.card}`}
                >
                  {p.tone === "orange" && (
                    <span className="absolute right-6 top-6 rounded-full bg-[#1f1218] px-3 py-1 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-black">{p.price}</span>
                    {p.suffix && <span className="text-sm font-semibold">{p.suffix}</span>}
                  </div>
                  <p className={`mt-1 ${t.muted}`}>{p.text}</p>
                  <ul className="mt-6 grid gap-3 text-[15px]">
                    {p.items.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${t.check}`}>
                          <Icon name="check" className="h-3 w-3" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <Button href={p.href} variant={t.button} className="w-full">
                      {p.cta}
                    </Button>
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
