import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getStore } from "@/lib/data";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "Заявка на аренду автомобиля", description: "Выберите автомобиль и даты, посмотрите предварительный расчёт и отправьте запрос менеджеру RPM Rent.", alternates: { canonical: "/booking" } };

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ car?: string; start?: string; end?: string; service?: string }> }) {
  const [params, store] = await Promise.all([searchParams, getStore()]);
  const [cars, services] = await Promise.all([store.getCars(), store.getServices()]);
  return (
    <div className="page booking-page"><div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог", href: "/cars" }, { label: "Заявка на аренду" }]} />
      <header className="booking-intro-simple"><h1 className="title">Заявка на аренду</h1></header>

      <ol className="booking-progress" aria-label="Этапы заявки"><li className="active"><span>01</span><strong>Автомобиль</strong></li><li><span>02</span><strong>Получение</strong></li><li><span>03</span><strong>Водитель</strong></li><li><span>04</span><strong>Подтверждение</strong></li></ol>

      <BookingForm cars={cars} services={services} initialCarSlug={params.car} initialStart={params.start} initialEnd={params.end} initialServiceSlug={params.service} />

      <section className="booking-after surface"><div><h2>Что произойдёт с заявкой</h2></div><div className="booking-after-list"><span><Check size={16} /> Сервер повторно проверит возраст, стаж, срок и цену.</span><span><Check size={16} /> Менеджер проверит детали и доступность автомобиля.</span><span><Check size={16} /> Договор оформляется после согласования.</span></div><Link className="text-link" href="/rental-terms">Условия аренды</Link></section>
    </div></div>
  );
}
