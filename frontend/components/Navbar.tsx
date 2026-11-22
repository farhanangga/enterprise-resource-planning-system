"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { brand, navLinks } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

/* Link navbar asli (di dalam hero, desktop) */
const linkCls =
  "relative text-[13px] font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100";

/* Tombol bar melayang. Sengaja TANPA class display (inline-flex/hidden),
   supaya tidak bentrok. Display diatur di tempat pemakaian. */
const floatBtn =
  "h-10 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1218] sm:h-11 sm:px-7";

// Sign Up (oranye) -> hover coklat
const floatSignUp = `${floatBtn} bg-[#ff9d66] text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(255,157,102,.9)] hover:bg-[#1f1218] hover:text-white hover:shadow-[0_16px_30px_-10px_rgba(31,18,24,.6)]`;

// Sign In (coklat) -> hover oranye
const floatSignIn = `${floatBtn} bg-[#1f1218] text-white shadow-[0_10px_24px_-8px_rgba(31,18,24,.65)] hover:bg-[#ff9d66] hover:text-[#1f1218] hover:shadow-[0_16px_30px_-10px_rgba(255,157,102,.9)]`;

// Display: bar (hanya tablet/desktop) dan menu full screen (mobile)
const barOnly = "hidden md:inline-flex";
const inMenu = "inline-flex w-full";

export default function Navbar() {
  const [floatOpen, setFloatOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<string>("#home");
  const [progress, setProgress] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  // Mobile (< 768px): bar selalu tampil. Desktop: bar tampil setelah navbar asli ter-scroll lewat.
  const show = isMobile || stuck;

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setFloatOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Tampilkan bar melayang saat navbar asli sudah tidak terlihat (di-scroll ke bawah)
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setStuck(scrolledPast);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Penanda menu aktif sesuai section yang sedang terlihat
  useEffect(() => {
    const targets = navLinks
      .map((l) => document.querySelector(l.href))
      .filter((n): n is Element => n !== null);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  // Garis progres scroll di dasar bar
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup menu dengan tombol Escape
  useEffect(() => {
    if (!floatOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFloatOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [floatOpen]);

  // Kunci scroll halaman saat menu full screen terbuka
  useEffect(() => {
    if (!floatOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [floatOpen]);

  return (
    <>
      {/* ===== Navbar asli (di dalam hero) =====
          Desktop: tinggi sama dengan tombol Sign Up / Sign In supaya sejajar.
          Mobile: tidak terlihat, hanya jadi pengganti ruang karena bar melayang sudah tampil sejak awal. */}
      <Reveal variant="down" delay={100}>
        <nav
          ref={navRef}
          aria-label="Main"
          className="relative flex h-[3.25rem] items-center justify-between max-md:invisible sm:h-[3.75rem] md:h-14"
        >
          <Link href="#home" className="text-base font-black tracking-wide transition-transform duration-300 hover:scale-105">
            {brand.name}
          </Link>

          <ul className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>

      {/* ===== Bar melayang + menu full screen.
          Memakai portal ke <body> supaya tidak terpengaruh transform/overflow/z-index dari hero. */}
      {mounted &&
        createPortal(
          <>
            {/* ----- Menu full screen (mobile), berada di bawah bar ----- */}
            <div
              id="floating-menu"
              aria-hidden={!floatOpen}
              className={`fixed inset-0 z-[55] flex h-[100dvh] flex-col overflow-y-auto bg-white px-5 pb-8 pt-[calc(4.5rem+env(safe-area-inset-top))] text-[#1f1218] transition-all duration-300 ease-out sm:px-10 sm:pt-[calc(5rem+env(safe-area-inset-top))] md:hidden ${
                floatOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
              }`}
            >
              <ul className="grid pt-2">
                {navLinks.map((l) => {
                  const isActive = active === l.href;
                  return (
                    <li key={l.href} className="border-b border-[#1f1218]/10">
                      <Link
                        href={l.href}
                        onClick={() => setFloatOpen(false)}
                        tabIndex={floatOpen ? 0 : -1}
                        className={`block py-4 text-lg font-semibold transition-colors duration-300 hover:text-[#e8641f] ${
                          isActive ? "text-[#e8641f]" : ""
                        }`}
                      >
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Sign Up dan Sign In hanya ada di sini pada mobile */}
              <div className="mt-auto grid grid-cols-2 gap-3 pt-8">
                <Link
                  href="/signup"
                  onClick={() => setFloatOpen(false)}
                  tabIndex={floatOpen ? 0 : -1}
                  className={`${floatSignUp} ${inMenu} !h-12`}
                >
                  Sign Up
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setFloatOpen(false)}
                  tabIndex={floatOpen ? 0 : -1}
                  className={`${floatSignIn} ${inMenu} !h-12`}
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* ----- Bar melayang: putih, selebar layar ----- */}
            <div
              aria-hidden={!show}
              className={`fixed inset-x-0 top-0 z-[60] bg-white/95 pt-[env(safe-area-inset-top)] text-[#1f1218] shadow-[0_18px_40px_-22px_rgba(31,18,24,.5)] backdrop-blur-md transition-all duration-300 ease-out ${
                show ? "visible translate-y-0 opacity-100" : "invisible -translate-y-full opacity-0"
              }`}
            >
              <nav
                aria-label="Floating"
                className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-5 sm:h-20 sm:px-10 md:grid md:grid-cols-[1fr_auto_1fr] lg:h-[5.5rem] lg:px-14"
              >
                {/* Logo */}
                <Link href="#home" onClick={() => setFloatOpen(false)} className="group flex items-center gap-3 justify-self-start">
                  <span className="text-lg font-black tracking-wide sm:text-xl">{brand.name}</span>
                </Link>

                {/* Menu desktop: pill di tengah */}
                <ul className="hidden items-center gap-1 rounded-full bg-[#1f1218]/[0.04] p-1.5 ring-1 ring-inset ring-[#1f1218]/10 md:flex">
                  {navLinks.map((l) => {
                    const isActive = active === l.href;
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          aria-current={isActive ? "true" : undefined}
                          className={`block rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                            isActive
                              ? "bg-[#1f1218] text-white shadow-[0_8px_18px_-8px_rgba(31,18,24,.7)]"
                              : "text-[#1f1218] hover:bg-[#ff9d66] hover:text-[#1f1218]"
                          }`}
                        >
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Kanan: desktop = Sign Up + Sign In, mobile = hanya hamburger */}
                <div className="flex items-center gap-2 justify-self-end sm:gap-3">
                  <Link href="/signup" className={`${floatSignUp} ${barOnly}`}>
                    Sign Up
                  </Link>
                  <Link href="/signin" className={`${floatSignIn} ${barOnly}`}>
                    Sign In
                  </Link>
                  <button
                    type="button"
                    aria-label={floatOpen ? "Close menu" : "Open menu"}
                    aria-expanded={floatOpen}
                    aria-controls="floating-menu"
                    onClick={() => setFloatOpen(!floatOpen)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1f1218] text-white transition-all duration-300 hover:bg-[#ff9d66] hover:text-[#1f1218] active:scale-95 sm:h-11 sm:w-11 md:hidden"
                  >
                    <Icon name={floatOpen ? "close" : "menu"} />
                  </button>
                </div>

                {/* Garis progres scroll */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-[#1f1218]/5">
                  <div
                    className="h-full origin-left bg-gradient-to-r from-[#ffb184] via-[#ff9d66] to-[#f27f45]"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </div>
              </nav>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}