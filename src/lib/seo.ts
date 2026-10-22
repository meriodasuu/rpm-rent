/** One origin for canonical links, the sitemap and structured data. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://rpmrent.ru").replace(/\/+$/, "");

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
