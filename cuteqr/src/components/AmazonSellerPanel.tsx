"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Plug, Store, Unplug } from "lucide-react";
import type { AmazonListing, AmazonMarketplace, AmazonRegion } from "@/lib/amazon";

interface Props {
  connected: boolean;
  configured: boolean;
}

export function AmazonSellerPanel({ connected, configured }: Props) {
  const [region, setRegion] = useState<AmazonRegion>("eu");
  const [marketplaces, setMarketplaces] = useState<AmazonMarketplace[]>([]);
  const [marketplaceId, setMarketplaceId] = useState("");
  const [listings, setListings] = useState<AmazonListing[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!connected) return;
    setLoadingMarkets(true);
    fetch("/api/amazon/marketplaces", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load Amazon marketplaces");
        setMarketplaces(data.marketplaces || []);
        if (data.marketplaces?.[0]?.id) setMarketplaceId(data.marketplaces[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingMarkets(false));
  }, [connected]);

  useEffect(() => {
    if (!connected || !marketplaceId) return;
    setLoadingListings(true);
    setError("");
    fetch(`/api/amazon/listings?marketplaceId=${encodeURIComponent(marketplaceId)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load Amazon products");
        setListings(data.listings || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingListings(false));
  }, [connected, marketplaceId]);

  if (!configured) {
    return (
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_18px_50px_-24px_rgba(61,50,38,0.25)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4df] text-2xl">🛒</div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Amazon Seller connection</h2>
            <p className="text-sm text-[var(--color-ink-soft)]">Code is ready. Add the Amazon production credentials to Vercel to activate it.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_18px_50px_-24px_rgba(61,50,38,0.25)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff4df]"><Store className="h-5 w-5" /></div>
          <div>
            <h2 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Connect your Amazon store</h2>
            <p className="text-sm text-[var(--color-ink-soft)]">Import your own listings and turn any product into a CuteQR.</p>
          </div>
        </div>

        <label className="mt-6 block text-sm font-bold text-[var(--color-ink)]">
          Seller region
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as AmazonRegion)}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--color-cream)] px-4 py-3 outline-none"
          >
            <option value="eu">Europe / UK / UAE / India</option>
            <option value="na">US / Canada / Mexico / Brazil</option>
            <option value="fe">Japan / Australia / Singapore</option>
          </select>
        </label>

        <a
          href={`/api/amazon/connect?region=${region}`}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 font-display text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          <Plug className="h-4 w-4" /> Connect Amazon Seller
        </a>
        <p className="mt-3 text-xs text-[var(--color-ink-soft)]">You’ll be redirected to Amazon to approve Product Listing access.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_18px_50px_-24px_rgba(61,50,38,0.25)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-extrabold text-[var(--color-ink)]">
            <span>✅</span> Amazon connected
          </div>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Pick one of your listings and CuteQR will fill the Amazon product link automatically.</p>
        </div>
        <form action="/api/amazon/disconnect" method="post">
          <button className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cream)] px-4 py-2 text-xs font-bold text-[var(--color-ink)]">
            <Unplug className="h-3.5 w-3.5" /> Disconnect
          </button>
        </form>
      </div>

      {loadingMarkets ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading marketplaces…</div>
      ) : marketplaces.length > 0 ? (
        <label className="mt-6 block text-sm font-bold text-[var(--color-ink)]">
          Marketplace
          <select
            value={marketplaceId}
            onChange={(e) => setMarketplaceId(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-black/10 bg-[var(--color-cream)] px-4 py-3 outline-none"
          >
            {marketplaces.map((marketplace) => (
              <option key={marketplace.id} value={marketplace.id}>
                {marketplace.name}{marketplace.countryCode ? ` (${marketplace.countryCode})` : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {error && <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-6 space-y-3">
        {loadingListings ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading your products…</div>
        ) : listings.length > 0 ? (
          listings.map((listing) => (
            <div key={listing.sku} className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-[var(--color-cream)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-[var(--color-ink)]">{listing.title}</p>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">SKU {listing.sku}{listing.asin ? ` · ASIN ${listing.asin}` : ""}</p>
              </div>
              {listing.productUrl ? (
                <a
                  href={`/?amazonUrl=${encodeURIComponent(listing.productUrl)}#generator`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-blush-deep)] px-4 py-2 text-xs font-bold text-white"
                >
                  Make CuteQR <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-xs font-semibold text-[var(--color-ink-soft)]">No product URL available</span>
              )}
            </div>
          ))
        ) : marketplaceId && !loadingListings && !error ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No listings returned for this marketplace yet.</p>
        ) : null}
      </div>
    </div>
  );
}
