import { Router } from "express";

const router = Router();


export const features: { icon: IconName; title: string; text: string }[] = [
  { icon: "finance", title: "Finance", text: "Track cash, invoices, and payments, and see your profit at a glance." },
  { icon: "hr", title: "HR", text: "Manage employees, attendance, leave, and payroll in one place." },
  { icon: "inventory", title: "Inventory", text: "Know what is in stock, in which warehouse, and when to reorder." },
  { icon: "sales", title: "Sales", text: "Turn quotes into orders and invoices, and follow every payment." },
  { icon: "operations", title: "Operations", text: "Connect purchasing, delivery, and approvals without spreadsheets." },
  { icon: "reports", title: "Reports", text: "Live dashboards that show how your business is doing today." },
];