import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChartColumn,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp,
  TriangleAlert,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";

/**
 * Daftar ikon yang dipakai di aplikasi (memakai lucide-react).
 * Nama di kiri dipakai di seluruh kode: <Icon name="finance" />
 * Untuk mengganti ikon, cukup ubah komponen di kanan.
 * Cari ikon lain di https://lucide.dev/icons
 */
const icons = {
  // modul
  finance: Wallet,
  hr: Users,
  inventory: Package,
  sales: TrendingUp,
  operations: SlidersHorizontal,
  reports: ChartColumn,
  purchasing: ShoppingCart,
  cart: ShoppingCart,
  // umum
  check: Check,
  arrow: ArrowRight,
  menu: Menu,
  close: X,
  edit: Pencil,
  plus: Plus,
  chevron: ChevronDown,
  alert: TriangleAlert,
  clock: Clock,
  // form
  mail: Mail,
  lock: Lock,
  user: User,
  building: Building2,
  eye: Eye,
  eyeOff: EyeOff,
  // dashboard
  dashboard: LayoutDashboard,
  settings: Settings,
  bell: Bell,
  search: Search,
  logout: LogOut,
  shield: ShieldCheck,
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const Cmp = icons[name];
  return <Cmp aria-hidden="true" className={className} />;
}
