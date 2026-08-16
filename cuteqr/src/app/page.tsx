import Link from "next/link";
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

      <section className="px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-6 text-center shadow-[0_20px_60px_-30px_rgba(61,50,38,0.28)] sm:p-8">
          <div className="text-4xl">📦🐾</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-[var(--color-ink)] sm:text-3xl">
            Selling on Amazon?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--color-ink-soft)] sm:text-base">
            Connect Seller Central, pick one of your products, and create a CuteQR that links straight to the Amazon listing.
          </p>
          <Link
            href="/amazon"
            className="mt-5 inline-flex rounded-full bg-[var(--color-ink)] px-6 py-3 font-display text-sm font-bold text-white transition-transform hover:scale-[1.02]"
          >
            Connect Amazon Store →
          </Link>
        </div>
      </section>

      <BeforeAfter />
      <PerfectFor />
      <HowItWorks />
      <Footer />
    </main>
  );
}
