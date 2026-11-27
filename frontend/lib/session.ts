import type { SessionUser } from "@/components/dashboard/types";

/** Kunci penyimpanan sesi (dipakai Sign In, Sign Up, dan dashboard) */
export const SESSION_KEY = "etera:user";

/** Baca sesi login. null = belum login. */
export function readSession(): SessionUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

/**
 * Simpan sesi login (tanpa password).
 * remember = true  → localStorage (tetap login setelah browser ditutup)
 * remember = false → sessionStorage (hanya selama tab ini)
 * Sesi lama di penyimpanan lainnya dihapus agar tidak bentrok.
 */
export function saveSession(user: SessionUser, remember: boolean) {
  try {
    const keep = remember ? window.localStorage : window.sessionStorage;
    const drop = remember ? window.sessionStorage : window.localStorage;
    drop.removeItem(SESSION_KEY);
    keep.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {}
}

/** Hapus sesi (Sign out) */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}
