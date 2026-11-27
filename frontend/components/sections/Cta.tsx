import { hero } from "@/lib/content";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Section";

export default function Cta() {
  return (
    <section className="px-6 pb-20 sm:px-10 lg:px-14 lg:pb-28">
      <Container>
        <Reveal variant="scale" duration={900}>
          <div className="relative overflow-hidden rounded-[36px] rounded-br-[64px] bg-[#ff9d66] px-8 py-12 text-[#1f1218] sm:px-14 sm:py-16">
            <div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/25" />
            <div aria-hidden className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-[#1f1218]/10" />
            <div className="relative flex flex-wrap items-center justify-between gap-8">
              <h2 className="max-w-[30rem] text-[clamp(1.75rem,3.8vw,2.75rem)] font-black uppercase leading-[1.05] tracking-tight">
                Ready to manage your company more easily?
              </h2>
              <Button href={hero.cta.href} variant="dark" size="lg" arrow>
                {hero.cta.label}
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
