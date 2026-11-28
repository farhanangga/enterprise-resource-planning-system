import type { Permission } from "@/components/dashboard/types";

export type NotifChannel = "inApp" | "email";

/** Satu jenis pemberitahuan. Hanya tampil untuk peran yang punya izin `perm`. */
export type NotifEvent = {
  id: string;
  label: string;
  description: string;
  perm: Permission;
  defaults: Record<NotifChannel, boolean>;
};

export type CompanySettings = {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string; // NPWP
  timezone: string;
  taxRate: number; // PPN (%)
  invoicePrefix: string;
  currency: string;
};

export type SettingsData = {
  company: CompanySettings;
  timezones: { value: string; label: string }[];
  notifications: NotifEvent[];
  passwordMinLength: number;
};
