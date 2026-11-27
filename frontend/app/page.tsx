import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Steps from "@/components/sections/Steps";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";
import Footer from "@/components/sections/Footer";
import { AboutSkeleton, HeroSkeleton } from "@/components/sections/Skeletons";

export const metadata: Metadata = {
  title: "ETERA – Manage your company more easily",
  description:
    "ETERA unifies finance, HR, inventory, sales, and operations in one platform. Faster decisions, streamlined processes, and a more growth-ready business.",
};

export default function LandingPage() {
  return (
    <div className="overflow-x-clip bg-white font-sans text-[#1f1218]">
      <main>
        <Suspense fallback={<HeroSkeleton />}>
          <Hero />
        </Suspense>
        <Suspense fallback={<AboutSkeleton />}>
          <About />
        </Suspense>
        <Steps />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
