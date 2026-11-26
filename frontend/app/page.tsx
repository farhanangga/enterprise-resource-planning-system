import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Steps from "@/components/sections/Steps";
import Footer from "@/components/sections/Footer";
import PricingFaq from "@/components/sections/pricingFaq";


export const metadata: Metadata = {
  title: "ETERA – Manage your company more easily",
  description:
    "ETERA unifies finance, HR, inventory, sales, and operations in one platform. Faster decisions, streamlined processes, and a more growth-ready business.",
};

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-white font-sans text-[#1f1218]">
      <main>
        <Hero />
        <About />
        <Steps />
        <PricingFaq />
      </main>
      <Footer />
    </div>
  );
}
