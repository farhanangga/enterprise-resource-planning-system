"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Overview from "./Overview";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { DashboardData, Permission, Role, SessionUser } from "./types";

const STORAGE_KEY = "etera:user"; // diisi oleh halaman Sign In / Sign Up

function readSession(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export default function DashboardShell({ data }: { data: DashboardData }) {
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
      setRole(r in data.roleInfo ? (r as Role) : "staff");
    } else if (data.settings.requireLogin) {
      router.replace("/signin");
    } else {
      setUser(data.settings.fallbackUser);
      const r = data.settings.fallbackUser.role.toLowerCase();
      setRole(r in data.roleInfo ? (r as Role) : "owner");
    }
  }, [data, router]);

  const can = (perm: Permission) => data.permissions[role].includes(perm);

  function signOut() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    router.push("/signin");
  }

  if (!user) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-white">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff9d66] border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  const roles = (Object.keys(data.roleInfo) as Role[]).map((value) => ({ value, label: data.roleInfo[value].label }));

  return (
    <div className="min-h-[100svh] bg-white text-[#1f1218]">
      <Sidebar
        menu={data.menu}
        adminMenu={data.adminMenu}
        can={can}
        user={user}
        roleLabel={data.roleInfo[role].label}
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
          role={role}
          roles={roles}
          allowRoleSwitch={data.settings.allowRoleSwitch}
          notifications={data.notifications}
          onRoleChange={setRole}
          onMenu={() => setMobileOpen(true)}
        />

        <main className="relative px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <Overview data={data} role={role} user={user} can={can} />
        </main>
      </div>
    </div>
  );
}
