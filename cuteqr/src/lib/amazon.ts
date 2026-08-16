import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type AmazonRegion = "na" | "eu" | "fe";

export interface AmazonSession {
  refreshToken: string;
  sellerId: string;
  region: AmazonRegion;
}

export interface AmazonMarketplace {
  id: string;
  name: string;
  countryCode: string;
  domain: string | null;
}

export interface AmazonListing {
  sku: string;
  asin: string | null;
  title: string;
  status: string[];
  productUrl: string | null;
}

const REGION_CONFIG: Record<AmazonRegion, { sellerCentral: string; endpoint: string }> = {
  na: {
    sellerCentral: "https://sellercentral.amazon.com",
    endpoint: "https://sellingpartnerapi-na.amazon.com",
  },
  eu: {
    sellerCentral: "https://sellercentral.amazon.co.uk",
    endpoint: "https://sellingpartnerapi-eu.amazon.com",
  },
  fe: {
    sellerCentral: "https://sellercentral.amazon.co.jp",
    endpoint: "https://sellingpartnerapi-fe.amazon.com",
  },
};

const MARKETPLACE_DOMAINS: Record<string, string> = {
  ATVPDKIKX0DER: "amazon.com",
  A2EUQ1WTGCTBG2: "amazon.ca",
  A1AM78C64UM0Y8: "amazon.com.mx",
  A2Q3Y263D00KWC: "amazon.com.br",
  A1F83G8C2ARO7P: "amazon.co.uk",
  A1PA6795UKMFR9: "amazon.de",
  A13V1IB3VIYZZH: "amazon.fr",
  APJ6JRA9NG5V4: "amazon.it",
  A1RKKUPIHCS9HS: "amazon.es",
  A1805IZSGTT6HS: "amazon.nl",
  A2NODRKZP88ZB9: "amazon.se",
  A1C3SOZRARQ6R3: "amazon.pl",
  AMEN7PMS3EDWL: "amazon.com.be",
  A33AVAJ2PDY3EV: "amazon.com.tr",
  A2VIGQ35RCS4UG: "amazon.ae",
  A17E79C6D8DWNP: "amazon.sa",
  A21TJRUUN4KGV: "amazon.in",
  A1VC38T7YXB528: "amazon.co.jp",
  A39IBJ37TRP1C6: "amazon.com.au",
  A19VAU5U5O7RUS: "amazon.sg",
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function isAmazonConfigured(): boolean {
  return Boolean(
    process.env.AMAZON_APP_ID &&
      process.env.AMAZON_LWA_CLIENT_ID &&
      process.env.AMAZON_LWA_CLIENT_SECRET &&
      process.env.AMAZON_SESSION_SECRET
  );
}

export function parseRegion(value: string | null | undefined): AmazonRegion {
  return value === "na" || value === "fe" ? value : "eu";
}

export function getAmazonRedirectUri(): string {
  return process.env.AMAZON_REDIRECT_URI || "https://cuteqr-weld.vercel.app/api/amazon/callback";
}

export function buildAmazonAuthorizationUrl(region: AmazonRegion, state: string): string {
  const appId = env("AMAZON_APP_ID");
  const config = REGION_CONFIG[region];
  const url = new URL("/apps/authorize/consent", config.sellerCentral);
  url.searchParams.set("application_id", appId);
  url.searchParams.set("state", state);
  if (process.env.AMAZON_APP_STATUS !== "published") {
    url.searchParams.set("version", "beta");
  }
  return url.toString();
}

export async function exchangeAmazonAuthorizationCode(code: string): Promise<{ refreshToken: string; accessToken: string }> {
  const response = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getAmazonRedirectUri(),
      client_id: env("AMAZON_LWA_CLIENT_ID"),
      client_secret: env("AMAZON_LWA_CLIENT_SECRET"),
    }),
    cache: "no-store",
  });

  const body = await response.json();
  if (!response.ok || !body.refresh_token || !body.access_token) {
    throw new Error(body.error_description || body.error || "Amazon token exchange failed");
  }

  return { refreshToken: body.refresh_token, accessToken: body.access_token };
}

async function getAmazonAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env("AMAZON_LWA_CLIENT_ID"),
      client_secret: env("AMAZON_LWA_CLIENT_SECRET"),
    }),
    cache: "no-store",
  });

  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || body.error || "Unable to refresh Amazon access token");
  }
  return body.access_token;
}

function amazonDate(): string {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
}

async function spApiFetch<T>(session: AmazonSession, path: string): Promise<T> {
  const accessToken = await getAmazonAccessToken(session.refreshToken);
  const endpoint = REGION_CONFIG[session.region].endpoint;
  const target = new URL(path, endpoint);
  const response = await fetch(target, {
    headers: {
      "x-amz-access-token": accessToken,
      "x-amz-date": amazonDate(),
      "user-agent": "CuteQR/0.1 (Language=TypeScript; Platform=Vercel)",
      accept: "application/json",
    },
    cache: "no-store",
  });

  const body = await response.json();
  if (!response.ok) {
    const message = body?.errors?.[0]?.message || body?.message || `Amazon SP-API error ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export async function getAmazonMarketplaces(session: AmazonSession): Promise<AmazonMarketplace[]> {
  type Response = {
    payload?: Array<{
      marketplace?: { id?: string; name?: string; countryCode?: string };
      participation?: { isParticipating?: boolean };
    }>;
  };

  const data = await spApiFetch<Response>(session, "/sellers/v1/marketplaceParticipations");
  return (data.payload || [])
    .filter((entry) => entry.participation?.isParticipating !== false && entry.marketplace?.id)
    .map((entry) => {
      const id = entry.marketplace!.id!;
      return {
        id,
        name: entry.marketplace?.name || id,
        countryCode: entry.marketplace?.countryCode || "",
        domain: MARKETPLACE_DOMAINS[id] || null,
      };
    });
}

export async function getAmazonListings(session: AmazonSession, marketplaceId: string): Promise<AmazonListing[]> {
  type Summary = { asin?: string; itemName?: string; status?: string[] };
  type Item = { sku?: string; summaries?: Summary[] };
  type Response = { items?: Item[] };

  const path = `/listings/2021-08-01/items/${encodeURIComponent(session.sellerId)}?marketplaceIds=${encodeURIComponent(
    marketplaceId
  )}&includedData=summaries&pageSize=20`;
  const data = await spApiFetch<Response>(session, path);
  const domain = MARKETPLACE_DOMAINS[marketplaceId];

  return (data.items || []).map((item) => {
    const summary = item.summaries?.[0] || {};
    const asin = summary.asin || null;
    return {
      sku: item.sku || "Unknown SKU",
      asin,
      title: summary.itemName || item.sku || "Amazon product",
      status: summary.status || [],
      productUrl: asin && domain ? `https://www.${domain}/dp/${asin}` : null,
    };
  });
}

function encryptionKey(): Buffer {
  return createHash("sha256").update(env("AMAZON_SESSION_SECRET")).digest();
}

export function encryptAmazonSession(session: AmazonSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptAmazonSession(value: string): AmazonSession | null {
  try {
    const [ivPart, tagPart, dataPart] = value.split(".");
    if (!ivPart || !tagPart || !dataPart) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivPart, "base64url"));
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(dataPart, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(plain) as AmazonSession;
  } catch {
    return null;
  }
}
