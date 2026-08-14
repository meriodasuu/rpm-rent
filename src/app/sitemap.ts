import type { MetadataRoute } from "next";
import { getStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = ["", "/cars", "/booking", "/services", "/rental-terms", "/about", "/faq", "/contacts", "/privacy", "/data-processing", "/personal-data-policy", "/cookies"];
  const cars = await (await getStore()).getCars();
  return [...paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "/cars" ? "daily" as const : "weekly" as const, priority: path === "" ? 1 : .7 })), ...cars.map((car) => ({ url: `${base}/cars/${car.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: .8 }))];
}
