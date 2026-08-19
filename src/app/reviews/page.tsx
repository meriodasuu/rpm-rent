import type { Metadata } from "next";
import { MyReviewsWidget } from "@/components/myreviews-widget";

export const metadata: Metadata = { title: "Отзывы клиентов", description: "Отзывы клиентов RPM Rent о прокате премиальных автомобилей в Санкт-Петербурге.", alternates: { canonical: "/reviews" } };

export default function ReviewsPage() {
  return <main className="page reviews-page"><div className="container"><header className="simple-page-heading"><h1 className="title">Отзывы<br /><span>клиентов</span></h1><p>Реальный опыт клиентов RPM Rent — рейтинг и отзывы из профиля на площадке отзывов.</p></header><section className="surface reviews-widget-section" aria-label="Отзывы клиентов RPM Rent"><MyReviewsWidget /></section></div></main>;
}
