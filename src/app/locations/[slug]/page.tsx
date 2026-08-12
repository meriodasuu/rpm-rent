import { ArrowRight, MapPinned } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getStore } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = await (await getStore()).getLocationBySlug(slug);
  if (!location) return { title: "Локация не найдена" };
  return {
    title: location.seoTitle || `${location.title} | RPM Rent`,
    description: location.seoDescription || location.description,
    alternates: { canonical: `/locations/${location.slug}` },
    openGraph: { images: [{ url: location.image, alt: location.title }] }
  };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = await (await getStore()).getLocationBySlug(slug);
  if (!location) notFound();

  return <main className="page">
    <div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Локации", href: "/#locations" }, { label: location.title }]} />
      <section className="surface" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ position: "relative", minHeight: "clamp(280px, 48vw, 560px)" }}>
          <Image src={location.image} alt={location.title} fill priority sizes="(max-width: 760px) 100vw, 1180px" style={{ objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6, 8, 12, .78), rgba(6, 8, 12, .18))" }} />
          <div style={{ position: "relative", zIndex: 1, minHeight: "inherit", padding: "clamp(24px, 5vw, 72px)", display: "grid", alignContent: "end", maxWidth: 720, color: "white" }}>
            <p className="eyebrow"><MapPinned size={15} /> {location.subtitle}</p>
            <h1 className="display">{location.title}</h1>
          </div>
        </div>
        <div style={{ padding: "clamp(24px, 5vw, 64px)", display: "grid", gap: 28 }}>
          <p className="subtitle" style={{ maxWidth: 760 }}>{location.description}</p>
          <div className="button-row"><Link className="button red" href="/cars">Выбрать автомобиль <ArrowRight size={18} /></Link><Link className="button ghost" href="/contacts">Связаться с нами</Link></div>
        </div>
      </section>
    </div>
  </main>;
}
