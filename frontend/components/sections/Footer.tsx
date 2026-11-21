import Link from "next/link";
import { brand, footerLinks } from "@/lib/content";
import { Container } from "@/components/ui/Section";

const link =
  "inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#ff9d66]";

export default function Footer() {
  return (
    <footer id="contact" className="rounded-t-[44px] bg-[#1f1218] px-6 pb-8 pt-14 text-white sm:px-10 lg:px-14">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-black tracking-wide">{brand.name}</p>
            <p className="mt-3 max-w-xs text-sm text-[#e3cdd4]">Unified ERP for growing companies.</p>
            <a href={`mailto:${brand.email}`} className="mt-4 inline-block text-sm font-semibold text-[#ff9d66] hover:underline">
              {brand.email}
            </a>
          </div>
          <nav aria-label="Footer">
            <p className="text-sm font-bold">Explore</p>
            <ul className="mt-3 grid gap-2 text-sm text-[#e3cdd4]">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-sm font-bold">Account</p>
            <ul className="mt-3 grid gap-2 text-sm text-[#e3cdd4]">
              <li><Link href="/signin" className={link}>Sign In</Link></li>
              <li><Link href="/signup" className={link}>Sign Up</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs text-[#e3cdd4]">
          © 2026 All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
