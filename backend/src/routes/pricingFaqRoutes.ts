import { Router } from "express";

const router = Router();

export type PlanTone = "white" | "orange" | "brown";

export type PlanItem = {
  name: string;
  price: string;
  suffix: string;
  text: string;
  items: string[];
  cta: string;
  href: string;
  tone: PlanTone;
};

export type FaqItem = {
  q: string;
  a: string;
};

export const plansData: PlanItem[] = [
  {
    name: "Starter",
    price: "Free",
    suffix: "",
    text: "For small shops getting organized.",
    items: ["1 company, 3 users", "Inventory and sales", "Basic reports"],
    cta: "Start free",
    href: "/auth/signUp",
    tone: "white",
  },
  {
    name: "Business",
    price: "Rp 299k",
    suffix: "/month",
    text: "For growing teams.",
    items: ["Unlimited users", "Finance, HR, and purchasing", "Roles and audit log"],
    cta: "Choose Business",
    href: "/auth/signUp",
    tone: "orange",
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    text: "For multi-branch companies.",
    items: ["Custom integrations", "Priority support", "Dedicated onboarding"],
    cta: "Talk to us",
    href: "#contact",
    tone: "brown",
  },
];

export const faqsData: FaqItem[] = [
  { q: "Do I need to install anything?", a: "No. ETERA runs in your browser on desktop, tablet, and phone." },
  {
    q: "Can my team have different access?",
    a: "Yes. Assign roles like Owner, Admin, Manager, Finance, and Staff, so each person sees only what they need.",
  },
  { q: "Is my company data separate from others?", a: "Yes. Every company’s data is isolated and protected." },
  { q: "Can I switch between light and dark mode?", a: "Yes. Choose Light, Dark, or follow your device in Settings." },
];

// GET /api/pricing-faq  -> { plans, faqs } dalam satu request
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Pricing and FAQ retrieved successfully",
    data: {
      plans: plansData,
      faqs: faqsData,
    },
  });
});

export default router;