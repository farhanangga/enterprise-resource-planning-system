"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { brand, navLinks } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

const linkCls =
  "relative text-[13px] font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100";

/* Tombol di bar melayang (latar putih, sudut kotak) */
/* Tombol di bar melayang: warna sama seperti di hero, sudut kotak */
/* Tombol di bar melayang: warna dan bentuk sama seperti di hero */
const floatBtn =
  "inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-semibold transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f1218] sm:h-10 sm:px-6 sm:text-sm";
// Sign In (coklat) -> hover oranye
const floatSignIn = `${floatBtn} bg-[#1f1218] text-white shadow-[0_10px_24px_-8px_rgba(31,18,24,.65)] hover:bg-[#ff9d66] hover:text-[#1f1218] hover:shadow-[0_16px_30px_-10px_rgba(255,157,102,.9)]`;

// Sign Up (oranye) -> hover coklat
const floatSignUp = `${floatBtn} bg-[#ff9d66] text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(255,157,102,.9)] hover:bg-[#1f1218] hover:text-white hover:shadow-[0_16px_30px_-10px_rgba(31,18,24,.6)]`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [floatOpen, setFloatOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Tampilkan bar melayang saat navbar asli sudah tidak terlihat (di-scroll ke bawah)
  useEffect(() => {
    setMounted(true);
    const el = navRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setStuck(scrolledPast);
        if (!scrolledPast) setFloatOpen(false);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Tutup menu melayang dengan tombol Escape
  useEffect(() => {
    if (!floatOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFloatOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [floatOpen]);

  return (
    <>
      {/* ===== Navbar asli (di dalam hero) ===== */}
      <Reveal variant="down" delay={100}>
        <nav ref={navRef} aria-label="Main" className="relative flex items-center justify-between">
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

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#1f1218] text-white transition-transform duration-300 hover:scale-110 md:hidden"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>

          <ul
            id="mobile-menu"
            className={`absolute right-0 top-12 z-20 w-48 origin-top-right rounded-2xl bg-[#1f1218] p-2 text-white shadow-xl transition-all duration-200 md:hidden ${
              open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
            }`}
          >
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#ff9d66] hover:text-[#1f1218]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Reveal>

      {/* ===== Bar melayang: putih, selebar layar, tanpa rounded =====
          Memakai portal ke <body> supaya tidak terpengaruh transform/overflow/z-index dari hero. */}
      {mounted &&
        createPortal(
          <div
            aria-hidden={!stuck}
            className={`fixed inset-x-0 top-0 z-50 border-b border-[#1f1218]/10 bg-white pt-[env(safe-area-inset-top)] text-[#1f1218] shadow-[0_12px_30px_-18px_rgba(31,18,24,.45)] transition-all duration-300 ease-out ${
              stuck ? "visible translate-y-0 opacity-100" : "invisible -translate-y-full opacity-0"
            }`}
          >
            <nav
              aria-label="Floating"
              className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-5 sm:h-16 sm:px-10 lg:px-14"
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

              <div className="flex items-center gap-2">
                <Link href="/signup" className={floatSignUp}>
                  Sign Up
                </Link>
                <Link href="/signin" className={floatSignIn}>
                  Sign In
                </Link>
                
                <button
                  type="button"
                  aria-label={floatOpen ? "Close menu" : "Open menu"}
                  aria-expanded={floatOpen}
                  aria-controls="floating-menu"
                  onClick={() => setFloatOpen(!floatOpen)}
                  className="grid h-9 w-9 shrink-0 place-items-center bg-[#1f1218] text-white transition-colors duration-300 hover:bg-[#ff9d66] hover:text-[#1f1218] md:hidden"
                >
                  <Icon name={floatOpen ? "close" : "menu"} />
                </button>
              </div>

              {/* Menu dropdown (mobile) */}
              <ul
                id="floating-menu"
                className={`absolute right-0 top-full z-20 w-full origin-top border-y border-[#1f1218]/10 bg-white p-2 shadow-[0_18px_30px_-18px_rgba(31,18,24,.5)] transition-all duration-200 sm:w-60 sm:border-x md:hidden ${
                  floatOpen ? "visible scale-y-100 opacity-100" : "invisible scale-y-95 opacity-0"
                }`}
              >
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setFloatOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold transition-colors hover:bg-[#1f1218] hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}