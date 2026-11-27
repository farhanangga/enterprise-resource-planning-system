import { steps } from "@/lib/content";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

export default function Steps() {
  return (
    <section
      id="services"
      className="rounded-tl-[44px] rounded-br-[44px] bg-[#1f1218] px-6 py-20 text-white sm:px-10 lg:px-14 lg:py-28"
    >
      <Container>
        <SectionHeading
          light
          title="Up and running in minutes"
          lead="No long implementation. Create your workspace, add your data, and start working."
        />
        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 150} className="h-full">
              <div className="group h-full rounded-[24px] border border-white/10 bg-white/5 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#ff9d66]/70 hover:bg-white/10">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ff9d66] text-lg font-black text-[#1f1218] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#e3cdd4]">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
