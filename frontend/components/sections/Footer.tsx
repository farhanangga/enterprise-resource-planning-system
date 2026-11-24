import Link from "next/link";
import { brand, footerLinks } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Section";

const link =
  "group inline-flex items-center gap-2 text-sm font-medium text-[#e3cdd4] transition-all duration-300 hover:translate-x-1 hover:text-[#ff9d66]";

const heading = "text-xs font-bold uppercase tracking-[0.18em] text-[#ff9d66]";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden rounded-t-[44px] bg-[#1f1218] px-6 pb-8 pt-16 text-white sm:px-10 lg:px-14 lg:pt-20"
    >
      {/* ===== Latar: grid garis kotak ===== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_30%,black,transparent)]"
      />
      {/* ===== Latar: blur oranye ===== */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-[#ff9d66]/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#ff9d66]/20 blur-3xl" />

      <Container className="relative z-10">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="text-3xl font-black tracking-wide">{brand.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#e3cdd4]">
              Unified ERP for growing companies. Finance, HR, inventory, and sales in one place.
            </p>
            <a
              href={`mailto:${brand.email}`}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#ff9d66] px-6 text-sm font-semibold text-[#1f1218] shadow-[0_10px_24px_-10px_rgba(255,157,102,.9)] transition-all duration-300 ease-out hover:bg-white hover:text-[#1f1218] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff9d66]"
            >
              {brand.email}
            </a>
          </div>

          {/* Explore */}
          <nav aria-label="Footer">
            <p className={heading}>Explore</p>
            <ul className="mt-4 grid gap-3">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account */}
          <div>
            <p className={heading}>Account</p>
            <ul className="mt-4 grid gap-3">
              <li>
                <Link href="/auth/signIn" className={link}>
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/signUp" className={link}>
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bawah */}
        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[#e3cdd4]">© 2026 ETERA. All rights reserved.</p>
          <Link
            href="#home"
            aria-label="Back to top"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-5 text-xs font-semibold text-white ring-1 ring-inset ring-white/15 transition-all duration-300 hover:bg-[#ff9d66] hover:text-[#1f1218] hover:ring-[#ff9d66] active:scale-[0.97]"
          >
            Back to top
            <Icon name="arrow" className="h-4 w-4 -rotate-90 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Container>
    </footer>
  );
}