"use client";

import { useState } from "react";
import { faqs } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import { Container, SectionHeading } from "@/components/ui/Section";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 pb-20 sm:px-10 lg:px-14 lg:pb-28">
      <Container className="grid gap-4 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <SectionHeading title="Questions" lead="Quick answers about getting started with ETERA." />
        <div>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 90}>
                <div className="border-b border-[#1f1218]/15">
                  <button
                    type="button"
                    id={`faq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-4 py-5 text-left text-base font-bold sm:text-lg"
                  >
                    <span className="transition-colors duration-300 group-hover:text-[#e8641f]">{f.q}</span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ff9d66] text-[#1f1218] transition-transform duration-300 group-hover:scale-110 ${
                        isOpen ? "rotate-45" : ""
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
                      <p className="max-w-[42rem] pb-5 leading-relaxed text-[#5d4a52]">{f.a}</p>
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
