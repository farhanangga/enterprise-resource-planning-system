"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type Variant = "up" | "down" | "left" | "right" | "scale" | "rise" | "mask" | "fade";

const hidden: Record<Variant, string> = {
  up: "opacity-0 translate-y-8",
  down: "opacity-0 -translate-y-6",
  left: "opacity-0 -translate-x-10",
  right: "opacity-0 translate-x-10",
  scale: "opacity-0 scale-90",
  rise: "opacity-0 translate-y-24 scale-95",
  mask: "translate-y-full", // dipakai di dalam parent overflow-hidden (efek teks naik)
  fade: "opacity-0",
};

const shown = "opacity-100 translate-x-0 translate-y-0 scale-100";
const reduced =
  "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100";

type Props = {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  /** jeda sebelum animasi mulai (ms) */
  delay?: number;
  /** lama animasi (ms) */
  duration?: number;
  className?: string;
};

/**
 * Memunculkan elemen saat masuk viewport (sekali saja).
 * Catatan: jangan taruh efek hover di elemen Reveal itu sendiri,
 * karena delay ikut berlaku. Taruh hover di elemen di dalamnya.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  variant = "up",
  delay = 0,
  duration = 800,
  className = "",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    // elemen "mask" tersembunyi oleh overflow parent, jadi amati parent-nya
    const target = variant === "mask" ? (el.parentElement ?? el) : el;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [variant]);

  const style: CSSProperties = { transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` };

  return (
    <Tag
      ref={ref}
      style={style}
      className={`transition-all ease-[cubic-bezier(.22,1,.36,1)] will-change-transform ${
        visible ? shown : hidden[variant]
      } ${reduced} ${className}`}
    >
      {children}
    </Tag>
  );
}
