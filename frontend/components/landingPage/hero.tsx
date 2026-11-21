import Image from "next/image";
import heroImg from "@/public/assets/hero.png";
import { hero } from "@/lib/content";
import Navbar from "@/components/Navbar";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

export default function Hero() {
  return (
    <header id="home" className="grid lg:min-h-[680px] lg:grid-cols-[3fr_2fr]">
      {/* Panel oranye (kiri) */}
      <div className="flex flex-col rounded-br-[32px] bg-[#ff9d66] px-6 pb-14 pt-6 text-[#1f1218] sm:px-10 lg:mb-14 lg:rounded-br-[44px] lg:px-14 lg:pt-7">
        <Navbar />

        <div className="my-auto py-14 lg:py-12">
          <h1 className="text-[clamp(2.4rem,5.4vw,4.75rem)] font-black uppercase leading-[1.02] tracking-tight">
            {hero.lines.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.04em]">
                <Reveal as="span" variant="mask" delay={200 + i * 130} duration={900} className="block">
                  {line}
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

      {/* Kolom putih (kanan): tombol auth + ilustrasi menempel di bawah */}
      <div className="flex flex-col items-center bg-white px-6 pt-6 dark:bg-white lg:px-10 lg:pt-7">
        <Reveal variant="down" delay={300} className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Button href="/signup" variant="orange" className="min-w-[8.5rem]">
            Sign Up
          </Button>
          <Button href="/signin" variant="dark" className="min-w-[8.5rem]">
            Sign In
          </Button>
        </Reveal>

        <Reveal variant="rise" duration={1100} delay={450} className="group relative mt-10 w-[72%] max-w-[440px] lg:mt-auto">
          {/* Div coklat (arch) di belakang hero.png */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-[58%] w-[112%] -translate-x-1/2 origin-bottom rounded-t-[44px] bg-[#1f1218] transition-transform duration-700 ease-out group-hover:scale-y-105 dark:bg-[#3a2730]"
          />
          <Image
            src={heroImg}
            alt="Business owner using a tablet to manage the company with ETERA"
            priority
            sizes="(min-width: 1024px) 440px, 72vw"
            className="relative z-10 h-auto w-full origin-bottom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </Reveal>
      </div>
    </header>
  );
}