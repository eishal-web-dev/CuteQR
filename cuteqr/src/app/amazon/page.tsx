import Link from "next/link";
import { cookies } from "next/headers";
import { AmazonSellerPanel } from "@/components/AmazonSellerPanel";
import { decryptAmazonSession, isAmazonConfigured } from "@/lib/amazon";

export const dynamic = "force-dynamic";

export default async function AmazonPage() {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get("cuteqr_amazon_session")?.value;
  const connected = Boolean(encrypted && decryptAmazonSession(encrypted));
  const configured = isAmazonConfigured();

  return (
    <main className="min-h-screen bg-[var(--color-cream)] px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
          ← Back to CuteQR
        </Link>

        <div className="mt-8 text-center">
          <div className="text-5xl">📦🐾</div>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-[var(--color-ink)] sm:text-5xl">
            CuteQR for Amazon Sellers
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[var(--color-ink-soft)]">
            Connect your Seller Central account, choose one of your own products, and create a cute scannable QR that points straight to the Amazon listing.
          </p>
        </div>

        <div className="mt-10">
          <AmazonSellerPanel connected={connected} configured={configured} />
        </div>

        <div className="mt-8 rounded-3xl border border-black/5 bg-white/60 p-5 text-sm text-[var(--color-ink-soft)]">
          <strong className="text-[var(--color-ink)]">Privacy first:</strong> CuteQR only needs Amazon Product Listing access for this feature. It does not need buyer names, shipping addresses, order payments, or other customer PII.
        </div>
      </div>
    </main>
  );
}
