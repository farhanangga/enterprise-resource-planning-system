import { features } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

export default function About() {
  return (
    <section id="about" className="px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
      <Container>
        <SectionHeading
          title="One platform for every team"
          lead="ETERA brings your daily operations into one workspace, so finance, HR, warehouse, and sales always work from the same numbers."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 120} className="h-full">
              <article className="group relative h-full overflow-hidden rounded-[28px] border border-[#1f1218]/10 bg-white shadow-sm p-7 transition-all duration-300 hover:-translate-y-2 hover:border-[#ff9d66] hover:bg-[#ff9d66] hover:text-[#1f1218] hover:shadow-[0_24px_40px_-20px_rgba(255,157,102,.9)]">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff9d66] text-[#1f1218] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#1f1218] group-hover:text-[#ff9d66]">
                  <Icon name={f.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#5d4a52] transition-colors duration-300 group-hover:text-[#1f1218]">
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
      </Container>
    </section>
  );
}