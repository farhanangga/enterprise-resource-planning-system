"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearSession, readSession } from "@/lib/session";
import { AppContext } from "./app-context";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { Permission, Role, SessionUser, ShellConfig } from "./types";

/** Kerangka bersama semua halaman setelah login: sidebar + topbar + konteks peran */
export default function AppShell({ config, children }: { config: ShellConfig; children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [role, setRole] = useState<Role>("staff");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // baca sesi dari Sign In
  useEffect(() => {
    const session = readSession();
    if (session) {
      setUser(session);
      const r = session.role.toLowerCase();
      setRole(r in config.roleInfo ? (r as Role) : "staff");
    } else if (config.settings.requireLogin) {
      router.replace(config.settings.signInHref);
    } else {
      setUser(config.settings.fallbackUser);
      const r = config.settings.fallbackUser.role.toLowerCase();
      setRole(r in config.roleInfo ? (r as Role) : "owner");
    }
  }, [config, router]);

  const can = (perm: Permission) => config.permissions[role].includes(perm);

  function signOut() {
    clearSession();
    router.push(config.settings.signInHref);
  }

  if (!user) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-white">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff9d66] border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  const roles = (Object.keys(config.roleInfo) as Role[]).map((value) => ({ value, label: config.roleInfo[value].label }));

  return (
    <AppContext.Provider value={{ role, user, roleInfo: config.roleInfo, can }}>
      <div className="min-h-[100svh] bg-white text-[#1f1218]">
        <Sidebar
          menu={config.menu}
          adminMenu={config.adminMenu}
          can={can}
          user={user}
          roleLabel={config.roleInfo[role].label}
          collapsed={collapsed}
          open={mobileOpen}
          onToggle={() => setCollapsed(!collapsed)}
          onClose={() => setMobileOpen(false)}
          onSignOut={signOut}
        />

        <div className={`relative transition-[padding] duration-300 ${collapsed ? "lg:pl-[84px]" : "lg:pl-64"}`}>
          {/* latar grid tipis */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[linear-gradient(rgba(31,18,24,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(31,18,24,.05)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_80%_90%_at_80%_0%,black,transparent)]"
          />

          <Topbar
            user={user}
            role={role}
            roleLabel={config.roleInfo[role].label}
            roles={roles}
            allowRoleSwitch={config.settings.allowRoleSwitch}
            notifications={config.notifications}
            onRoleChange={setRole}
            onMenu={() => setMobileOpen(true)}
            onSignOut={signOut}
          />

          <main className="relative px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
