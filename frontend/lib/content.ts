import type { IconName } from "@/components/ui/Icon";

export const brand = { name: "ETERA", email: "hello@etera.app" };

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

export const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const hero = {
  lines: ["Manage your", "company more", "easily"],
  text: "Unifying finance, HR, inventory, sales, and operations in one platform. Faster decisions, streamlined processes, and a more growth-ready business.",
  cta: { label: "Start Now", href: "/auth/signUp" },
};

export const features: { icon: IconName; title: string; text: string }[] = [
  { icon: "finance", title: "Finance", text: "Track cash, invoices, and payments, and see your profit at a glance." },
  { icon: "hr", title: "HR", text: "Manage employees, attendance, leave, and payroll in one place." },
  { icon: "inventory", title: "Inventory", text: "Know what is in stock, in which warehouse, and when to reorder." },
  { icon: "sales", title: "Sales", text: "Turn quotes into orders and invoices, and follow every payment." },
  { icon: "operations", title: "Operations", text: "Connect purchasing, delivery, and approvals without spreadsheets." },
  { icon: "reports", title: "Reports", text: "Live dashboards that show how your business is doing today." },
];

export const steps = [
  { title: "Create your account", text: "Sign up with your email and name your company." },
  { title: "Set up your business", text: "Add products and customers, then invite your team." },
  { title: "Run it from one dashboard", text: "Record transactions and watch your numbers update live." },
];

export const plans = [
  {
    name: "Starter",
    price: "Free",
    suffix: "",
    text: "For small shops getting organized.",
    items: ["1 company, 3 users", "Inventory and sales", "Basic reports"],
    cta: "Start free",
    href: "/auth/signUp",
    tone: "white" as const,
  },
  {
    name: "Business",
    price: "Rp 299k",
    suffix: "/month",
    text: "For growing teams.",
    items: ["Unlimited users", "Finance, HR, and purchasing", "Roles and audit log"],
    cta: "Choose Business",
    href: "/auth/signUp",
    tone: "orange" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    text: "For multi-branch companies.",
    items: ["Custom integrations", "Priority support", "Dedicated onboarding"],
    cta: "Talk to us",
    href: "#contact",
    tone: "brown" as const,
  },
];

export const faqs = [
  { q: "Do I need to install anything?", a: "No. ETERA runs in your browser on desktop, tablet, and phone." },
  {
    q: "Can my team have different access?",
    a: "Yes. Assign roles like Owner, Admin, Manager, Finance, and Staff, so each person sees only what they need.",
  },
  { q: "Is my company data separate from others?", a: "Yes. Every company’s data is isolated and protected." },
  { q: "Can I switch between light and dark mode?", a: "Yes. Choose Light, Dark, or follow your device in Settings." },
];
