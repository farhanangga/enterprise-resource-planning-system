"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { MenuItem, Permission, SessionUser } from "./types";

type Props = {
  menu: MenuItem[];
  adminMenu: MenuItem[];
  can: (perm: Permission) => boolean;
  user: SessionUser;
  roleLabel: string;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
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

function NavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: MenuItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const base = `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
    collapsed ? "lg:justify-center lg:px-0" : ""
  }`;
  const hide = collapsed ? "lg:hidden" : "";
  const content = (
    <>
      <Icon name={item.icon} className="h-5 w-5 shrink-0" />
      <span className={hide}>{item.label}</span>
      {!item.ready && (
        <span className={`ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-[#ff9d66] ${hide}`}>Soon</span>
      )}
    </>
  );

  if (!item.ready) {
    return (
      <li>
        <span title={`${item.label} (coming soon)`} aria-disabled="true" className={`${base} cursor-not-allowed text-white/45`}>
          {content}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        title={item.label}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={`${base} ${active ? "bg-[#ff9d66] text-[#1f1218]" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
      >
        {content}
      </Link>
    </li>
  );
}

export default function Sidebar({ menu, adminMenu, can, user, roleLabel, collapsed, open, onToggle, onClose, onSignOut }: Props) {
  const pathname = usePathname();
  const main = menu.filter((m) => can(m.perm));
  const admin = adminMenu.filter((m) => can(m.perm));
  const hide = collapsed ? "lg:hidden" : "";

  return (
    <>
      {/* overlay mobile */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-40 bg-[#1f1218]/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1f1218] text-white transition-all duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-[84px]" : "lg:w-64"}`}
      >
        {/* logo + tombol kecilkan sidebar */}
        <div className={`flex h-16 items-center justify-between px-5 ${collapsed ? "lg:justify-center lg:gap-1 lg:px-2" : ""}`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 text-lg font-black tracking-wide">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#ff9d66] text-[#1f1218]">E</span>
            <span className={hide}>ETERA</span>
          </Link>

          {/* desktop: kecilkan / besarkan sidebar */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white lg:grid"
          >
            <Icon name="chevron" className={`h-5 w-5 transition-transform duration-300 ${collapsed ? "-rotate-90" : "rotate-90"}`} />
          </button>

          {/* mobile: tutup menu */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* perusahaan */}
        <div className={`mx-3 mb-3 rounded-2xl bg-white/5 p-3 ${collapsed ? "lg:hidden" : ""}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Company</p>
          <p className="mt-0.5 truncate text-sm font-bold">{user.company}</p>
        </div>

        {/* navigasi */}
        <nav aria-label="Dashboard" className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-3">
          <p className={`px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-white/40 ${hide}`}>Main</p>
          <ul className="grid gap-1">
            {main.map((item) => (
              <NavItem key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} onClick={onClose} />
            ))}
          </ul>

          {admin.length > 0 && (
            <>
              <p className={`px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-white/40 ${hide}`}>Manage</p>
              <ul className="grid gap-1">
                {admin.map((item) => (
                  <NavItem key={item.href} item={item} active={pathname === item.href} collapsed={collapsed} onClick={onClose} />
                ))}
              </ul>
            </>
          )}
        </nav>

        {/* profil + keluar */}
        <div className="border-t border-white/10 p-3">
          <div className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? "lg:justify-center" : ""}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff9d66] text-xs font-black text-[#1f1218]">
              {initials(user.name)}
            </span>
            <span className={`min-w-0 leading-tight ${hide}`}>
              <b className="block truncate text-sm">{user.name}</b>
              <span className="text-xs text-white/60">{roleLabel}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <Icon name="logout" className="h-5 w-5 shrink-0" />
            <span className={hide}>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
