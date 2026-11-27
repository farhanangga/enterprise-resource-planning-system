import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

// Hover sederhana: hanya ganti warna
const variants = {
  orange: "bg-[#ff9d66] text-[#1f1218] hover:bg-[#1f1218] hover:text-white",
  dark: "bg-[#1f1218] text-white hover:bg-[#ff9d66] hover:text-[#1f1218]",
  outline: "bg-transparent text-[#1f1218] ring-2 ring-inset ring-[#1f1218] hover:bg-[#1f1218] hover:text-white",
  accent: "bg-[#ff9d66] text-[#1f1218] hover:bg-white",
  mauve: "bg-[#7a5561] text-white hover:bg-[#1f1218]",
  light: "bg-white text-[#1f1218] hover:bg-[#1f1218] hover:text-white",
} as const;

const sizes = {
  md: "px-8 py-3 text-sm",
  lg: "px-10 py-4 text-base",
} as const;

type Props = {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  arrow?: boolean;
  className?: string;
};

/** Tombol pill. Saat hover hanya berganti warna. */
export default function Button({ href, children, variant = "orange", size = "md", arrow = false, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e7be0] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
      {arrow && <Icon name="arrow" className="h-4 w-4" />}
    </Link>
  );
}
