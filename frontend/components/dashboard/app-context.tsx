"use client";

import { createContext, useContext } from "react";
import type { Permission, Role, SessionUser, ShellConfig } from "./types";

export type AppContextValue = {
  role: Role;
  user: SessionUser;
  roleInfo: ShellConfig["roleInfo"];
  can: (perm: Permission) => boolean;
};

export const AppContext = createContext<AppContextValue | null>(null);

/** Ambil peran, user, dan fungsi izin dari AppShell */
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside <AppShell>");
  return value;
}
