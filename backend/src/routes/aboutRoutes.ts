import { Router } from "express";

const router = Router();

// Nama ikon harus sama dengan yang ada di frontend (components/ui/Icon.tsx)
export type IconName = "finance" | "hr" | "inventory" | "sales" | "operations" | "reports";

export type AboutItem = {
  icon: IconName;
  title: string;
  text: string;
};

export const aboutData: AboutItem[] = [
  { icon: "finance", title: "Finance", text: "Track cash, invoices, and payments, and see your profit at a glance." },
  { icon: "hr", title: "HR", text: "Manage employees, attendance, leave, and payroll in one place." },
  { icon: "inventory", title: "Inventory", text: "Know what is in stock, in which warehouse, and when to reorder." },
  { icon: "sales", title: "Sales", text: "Turn quotes into orders and invoices, and follow every payment." },
  { icon: "operations", title: "Operations", text: "Connect purchasing, delivery, and approvals without spreadsheets." },
  { icon: "reports", title: "Reports", text: "Live dashboards that show how your business is doing today." },
];

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "About retrieved successfully",
    data: aboutData,
  });
});

export default router;