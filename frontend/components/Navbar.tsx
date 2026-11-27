"use client";

import Link from "next/link";
import { useState } from "react";
import { brand, navLinks } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

const linkCls =
  "relative text-[13px] font-semibold after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <Reveal variant="down" delay={100}>
      <nav aria-label="Main" className="relative flex items-center justify-between">
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
          className="grid h-10 w-10 place-items-center rounded-full bg-[#1f1218] text-white transition-colors duration-200 hover:bg-[#ff9d66] hover:text-[#1f1218] md:hidden"
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
  );
}
