import type { Metadata } from "next";
import SignUpForm from "@/components/auth/signUpForm";

export const metadata: Metadata = {
  title: "Sign Up – ETERA",
  description: "Create your ETERA account and start managing your company in one place.",
};

/* =====================================================================
   DATA HALAMAN SIGN UP (statis) — atur semuanya di sini.
   Catatan: ini hanya untuk demo/prototipe. Untuk produksi, cek email
   yang sudah terdaftar dan buat akun lewat API.
   ===================================================================== */

/** Email yang dianggap sudah terdaftar (untuk simulasi error "email sudah dipakai") */
const existingEmails = ["owner@etera.app", "admin@etera.app", "manager@etera.app", "finance@etera.app", "staff@etera.app"];

/** Pilihan jenis usaha */
const industries = ["Retail", "Food & Beverage", "Manufacturing", "Distribution", "Services", "Other"];

/** Teks di panel oranye */
const copy = {
  lines: ["Start running", "your company", "in minutes"],
  text: "Create your account, set up your business, and invite your team. No long implementation needed.",
  steps: [
    { title: "Create your account", text: "Sign up with your email and name your company." },
    { title: "Set up your business", text: "Add products and customers, then invite your team." },
    { title: "Run it from one dashboard", text: "Record transactions and watch your numbers update live." },
  ],
};

/** Tujuan setelah akun berhasil dibuat */
const redirectTo = "/dashboard";

/** Alamat halaman Sign In (sesuaikan dengan struktur folder Anda) */
const signInHref = "/auth/signIn";

export default function SignUpPage() {
  return (
    <SignUpForm
      existingEmails={existingEmails}
      industries={industries}
      copy={copy}
      redirectTo={redirectTo}
      signInHref={signInHref}
    />
  );
}
