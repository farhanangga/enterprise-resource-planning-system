import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

const variants = {
  orange: "bg-[#ff9d66] text-[#1f1218] before:bg-[#1f1218] hover:text-white",
  dark: "bg-[#1f1218] text-white before:bg-[#ff9d66] hover:text-[#1f1218]",
  accent: "bg-[#ff9d66] text-[#1f1218] before:bg-white",
  mauve: "bg-[#7a5561] text-white before:bg-[#1f1218]",
  light: "bg-white text-[#1f1218] before:bg-[#1f1218] hover:text-white",
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

/** Tombol pill dengan efek "fill sweep" saat hover. */
export default function Button({ href, children, variant = "orange", size = "md", arrow = false, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`group relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold shadow-sm transition-[color,transform,box-shadow] duration-300 before:absolute before:inset-0 before:-z-10 before:translate-y-full before:rounded-full before:transition-transform before:duration-300 before:ease-out hover:-translate-y-0.5 hover:shadow-lg hover:before:translate-y-0 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e7be0] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
      {arrow && <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />}
    </Link>
  );
}
