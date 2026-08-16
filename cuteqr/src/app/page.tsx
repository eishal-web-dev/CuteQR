import { Hero } from "@/components/Hero";
import { QRGenerator } from "@/components/QRGenerator";
import { BeforeAfter } from "@/components/BeforeAfter";
import { PerfectFor } from "@/components/PerfectFor";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-cream)]">
      <Hero />
      <section className="px-6 pb-16">
        <QRGenerator />
      </section>
      <BeforeAfter />
      <PerfectFor />
      <HowItWorks />
      <Footer />
    </main>
  );
}
