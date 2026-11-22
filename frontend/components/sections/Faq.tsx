"use client";

import { useState } from "react";
import { faqs } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative overflow-hidden bg-white px-6 pb-20 pt-4 text-[#1f1218] sm:px-10 lg:px-14 lg:pb-28">
      {/* ===== Latar: grid garis kotak ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(31,18,24,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.07)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_50%,black,transparent)]"
      />
      {/* ===== Latar: blur oranye di sisi kiri ===== */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[10%] h-[26rem] w-[26rem] rounded-full bg-[#ff9d66]/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-[4%] h-72 w-72 rounded-full bg-[#ff9d66]/25 blur-3xl" />

      <Container className="relative z-10 grid gap-4 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <SectionHeading title="Questions" lead="Quick answers about getting started with ETERA." />
        <div className="grid gap-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 90}>
                <div
                  className={`overflow-hidden rounded-[24px] border transition-all duration-300 hover:-translate-y-0.5 ${
                    isOpen
                      ? "border-[#1f1218] bg-[#1f1218] text-white shadow-[0_24px_40px_-22px_rgba(31,18,24,.7)]"
                      : "border-[#1f1218]/10 bg-[#ff9d66] text-[#1f1218] shadow-[0_18px_36px_-22px_rgba(255,157,102,.9)] hover:border-[#1f1218] hover:bg-[#1f1218] hover:text-white"
                  }`}
                >
                  <button
                    type="button"
                    id={`faq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#ff9d66] sm:text-lg"
                  >
                    <span>{f.q}</span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300 group-hover:scale-110 ${
                        isOpen
                          ? "rotate-45 bg-[#ff9d66] text-[#1f1218]"
                          : "bg-[#1f1218] text-[#ff9d66] group-hover:bg-[#ff9d66] group-hover:text-[#1f1218]"
                      }`}
                    >
                      <Icon name="plus" className="h-4 w-4" />
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[42rem] px-6 pb-6 leading-relaxed text-[#e3cdd4]">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}