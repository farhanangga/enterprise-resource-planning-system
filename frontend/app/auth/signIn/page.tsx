import type { Metadata } from "next";
import SignInForm, { type Account } from "@/components/auth/signInForm";

export const metadata: Metadata = {
  title: "Sign In – ETERA",
  description: "Sign in to your ETERA workspace.",
};

/* =====================================================================
   DATA HALAMAN SIGN IN (statis) — atur semuanya di sini.
   Catatan: ini hanya untuk demo/prototipe. Data ini ikut terkirim ke
   browser, jadi JANGAN dipakai untuk akun asli. Untuk produksi, ganti
   dengan pemanggilan API login (password di-hash di server).
   ===================================================================== */

/** Akun yang boleh masuk */
const accounts: Account[] = [
  { name: "Rina Pratama", email: "owner@etera.app", password: "Etera123", role: "Owner", company: "Toko Rina" },
  { name: "Budi Santoso", email: "admin@etera.app", password: "Etera123", role: "Admin", company: "Toko Rina" },
  { name: "Dewi Anggraini", email: "manager@etera.app", password: "Etera123", role: "Manager", company: "Toko Rina" },
  { name: "Dedi Kurniawan", email: "finance@etera.app", password: "Etera123", role: "Finance", company: "Toko Rina" },
  { name: "Sari Wulandari", email: "staff@etera.app", password: "Etera123", role: "Staff", company: "Toko Rina" },
];

/** Teks di panel oranye */
const copy = {
  lines: ["Welcome back", "to your", "workspace"],
  text: "Pick up right where you left off. Your finance, HR, inventory, and sales are waiting in one place.",
  perks: ["See today’s numbers on one dashboard", "Pick up orders, stock, and invoices", "Your team, with the right access"],
};

/** Tujuan setelah login berhasil */
const redirectTo = "/dashboard/main";

/** Alamat halaman lain (sesuaikan dengan struktur folder Anda) */
const signUpHref = "/auth/signUp";
const forgotHref = "/forgot-password";

/** Tampilkan kotak "Demo account" di bawah form (matikan sebelum rilis) */
const showDemoHint = true;

export default function SignInPage() {
  return (
    <SignInForm
      accounts={accounts}
      copy={copy}
      redirectTo={redirectTo}
      signUpHref={signUpHref}
      forgotHref={forgotHref}
      showDemoHint={showDemoHint}
    />
  );
}
