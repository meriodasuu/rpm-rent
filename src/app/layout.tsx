import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { ExperienceAnalytics } from "@/components/experience-analytics";
import { MarketingAttribution } from "@/components/marketing-attribution";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeInitScript } from "@/components/theme-init-script";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RPM Rent | аренда автомобилей в Санкт-Петербурге", template: "%s | RPM Rent" },
  description: "Сравните автомобили RPM Rent, укажите даты и оформите аренду в Санкт-Петербурге.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "RPM Rent",
    title: "RPM Rent | аренда автомобилей в Санкт-Петербурге",
    description: "Сравните автомобили, проверьте даты и отправьте обращение менеджеру.",
    images: [{ url: "/images/cars/porsche-911-carrera-4s/01.jpg", width: 1200, height: 900, alt: "Porsche 911 из автопарка RPM Rent" }]
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: "RPM Rent",
  url: siteUrl,
  telephone: "+7 993 983-80-80",
  email: "rpmrent78@gmail.com",
  address: { "@type": "PostalAddress", addressLocality: "Санкт-Петербург", streetAddress: "проспект Маршала Блюхера, 12к7" },
  areaServed: "Санкт-Петербург"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-scroll-behavior="smooth" className={manrope.variable} suppressHydrationWarning>
      <head><ThemeInitScript /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></head>
      <body>
        <SiteChrome header={<Header />} footer={<Footer />}>{children}</SiteChrome>
        <Analytics />
        <ExperienceAnalytics />
        <MarketingAttribution />
      </body>
    </html>
  );
}
