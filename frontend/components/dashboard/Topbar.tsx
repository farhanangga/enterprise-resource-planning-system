"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Role, SessionUser } from "./types";

type Props = {
  user: SessionUser;
  role: Role;
  roleLabel: string;
  roles: { value: Role; label: string }[];
  allowRoleSwitch: boolean;
  notifications: { text: string; time: string }[];
  onRoleChange: (r: Role) => void;
  onMenu: () => void;
  onSignOut: () => void;
};

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "U"
  );
}

export default function Topbar({ user, role, roleLabel, roles, allowRoleSwitch, notifications, onRoleChange, onMenu, onSignOut }: Props) {
  const [panel, setPanel] = useState<"none" | "notif" | "profile">("none");
  const ref = useRef<HTMLDivElement>(null);

  // tutup panel saat klik di luar
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPanel("none");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const iconBtn =
    "relative grid h-10 w-10 place-items-center rounded-full border border-[#1f1218]/10 bg-white text-[#1f1218] transition-colors duration-200 hover:bg-[#ff9d66]";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#1f1218]/10 bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button type="button" onClick={onMenu} aria-label="Open menu" className={`${iconBtn} lg:hidden`}>
        <Icon name="menu" className="h-5 w-5" />
      </button>

      {/* pencarian */}
      <label className="group relative hidden max-w-md flex-1 sm:block">
        <span className="sr-only">Search</span>
        <Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#5d4a52] transition-colors group-focus-within:text-[#e8641f]"
        />
        <input
          type="search"
          placeholder="Search products, orders, invoices…"
          className="h-10 w-full rounded-full border border-[#1f1218]/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#5d4a52]/60 focus:border-[#ff9d66] focus:ring-4 focus:ring-[#ff9d66]/25"
        />
      </label>

      <div ref={ref} className="ml-auto flex items-center gap-2 sm:gap-3">
        {allowRoleSwitch && (
          <label className="flex items-center gap-2 rounded-full border border-dashed border-[#ff9d66] bg-[#ff9d66]/10 py-1 pl-3 pr-1 text-xs font-semibold">
            <span className="hidden sm:inline">Viewing as</span>
            <span className="relative">
              <select
                value={role}
                onChange={(e) => onRoleChange(e.target.value as Role)}
                aria-label="Preview dashboard as role"
                className="h-8 cursor-pointer appearance-none rounded-full bg-[#1f1218] pl-3 pr-8 text-xs font-bold text-white outline-none transition-colors hover:bg-[#3a2730] focus-visible:ring-2 focus-visible:ring-[#ff9d66]"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <Icon name="chevron" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white" />
            </span>
          </label>
        )}

        {/* notifikasi */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPanel(panel === "notif" ? "none" : "notif")}
            aria-label="Notifications"
            aria-expanded={panel === "notif"}
            className={iconBtn}
          >
            <Icon name="bell" className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#e8641f] ring-2 ring-white" />
          </button>
          {panel === "notif" && (
            <div className="absolute right-0 top-12 w-80 max-w-[85vw] rounded-2xl border border-[#1f1218]/10 bg-white p-2 shadow-[0_24px_48px_-20px_rgba(31,18,24,.45)]">
              <p className="px-3 py-2 text-sm font-black">Notifications</p>
              <ul>
                {notifications.map((n) => (
                  <li key={n.text} className="rounded-xl px-3 py-2.5 transition-colors hover:bg-[#ff9d66]/15">
                    <p className="text-sm font-semibold leading-snug">{n.text}</p>
                    <p className="mt-0.5 text-xs text-[#5d4a52]">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* profil */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPanel(panel === "profile" ? "none" : "profile")}
            aria-label="Account menu"
            aria-expanded={panel === "profile"}
            className="flex items-center gap-2 rounded-full border border-[#1f1218]/10 bg-white py-1 pl-1 pr-3 transition-colors duration-200 hover:bg-[#ff9d66]/20"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff9d66] text-xs font-black">{initials(user.name)}</span>
            <span className="hidden text-left leading-tight md:block">
              <b className="block text-[13px]">{user.name.split(" ")[0]}</b>
              <span className="text-[11px] text-[#5d4a52]">{roleLabel}</span>
            </span>
            <Icon name="chevron" className="hidden h-4 w-4 md:block" />
          </button>
          {panel === "profile" && (
            <div className="absolute right-0 top-12 w-64 rounded-2xl border border-[#1f1218]/10 bg-white p-2 shadow-[0_24px_48px_-20px_rgba(31,18,24,.45)]">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-black">{user.name}</p>
                <p className="truncate text-xs text-[#5d4a52]">{user.email}</p>
                <span className="mt-2 inline-block rounded-full bg-[#1f1218] px-2.5 py-0.5 text-[11px] font-bold text-white">{roleLabel}</span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#ff9d66]/20"
              >
                <Icon name="logout" className="h-[18px] w-[18px]" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
