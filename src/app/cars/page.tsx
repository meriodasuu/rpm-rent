import { ArrowRight, CalendarDays, CircleDollarSign, ListFilter, ScanSearch } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getStore } from "@/lib/data";
import { assertRentalPeriod, parseDateOnly } from "@/lib/domain/dates";
import { CatalogClient } from "./catalog-client";

export const metadata: Metadata = {
  title: "Каталог автомобилей для аренды",
  description: "Сравните автомобили RPM Rent по классу, кузову и стоимости. Укажите даты, чтобы проверить доступность.",
  alternates: { canonical: "/cars" }
};

export default async function CarsPage({ searchParams }: { searchParams: Promise<{ category?: string; maxPrice?: string; start?: string; end?: string }> }) {
  const store = await getStore();
  const [cars, params] = await Promise.all([store.getCars(), searchParams]);
  const start = params.start && parseDateOnly(params.start) ? params.start : null;
  const end = params.end && parseDateOnly(params.end) ? params.end : null;
  let hasValidPeriod = false;
  if (start && end) {
    try { assertRentalPeriod({ startDate: start, endDate: end }); hasValidPeriod = true; } catch { hasValidPeriod = false; }
  }
  const availability = hasValidPeriod && start && end
    ? Object.fromEntries(await Promise.all(cars.map(async (car) => [car.id, await store.isCarAvailable(car.id, start, end)])))
    : undefined;

  return (
    <div className="page catalog-page">
      <div className="container">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
        <div className="page-intro catalog-intro">
          <div><p className="eyebrow">Автопарк RPM Rent</p><h1 className="title">Найдите автомобиль под свой маршрут</h1></div>
          <div><p className="subtitle">Сравнивайте кузов, класс и суточную ставку. Откройте карточку автомобиля, чтобы увидеть фотографии, залог, доступные характеристики и перейти к проверке дат.</p>{hasValidPeriod && start && end ? <p className="period-banner"><CalendarDays size={17} /> Проверен период с {new Date(`${start}T00:00:00Z`).toLocaleDateString("ru-RU")} по {new Date(`${end}T00:00:00Z`).toLocaleDateString("ru-RU")}. Занятые машины остаются видимыми с объяснением.</p> : <p className="period-banner"><CalendarDays size={17} /> Без корректных дат показан весь опубликованный каталог. Период можно выбрать на главной или при оформлении.</p>}</div>
        </div>

        <div className="catalog-discovery" aria-label="Категории автомобилей">
          <Link href="/cars?category=Спорт" data-event="filter_change" data-event-label="discovery_sport"><Image src="/images/cars/porsche-911-carrera-4s/01.jpg" alt="Porsche 911 Carrera 4S из каталога" fill sizes="(max-width:760px) 100vw, 34vw" /><span>01 / Спорт</span><strong>Для личного маршрута</strong><ArrowRight size={19} /></Link>
          <Link href="/cars?category=SUV" data-event="filter_change" data-event-label="discovery_suv"><Image src="/images/cars/lamborghini-urus/05.jpg" alt="Lamborghini Urus из каталога" fill sizes="(max-width:760px) 100vw, 34vw" /><span>02 / SUV</span><strong>Для города и пространства</strong><ArrowRight size={19} /></Link>
          <Link href="/cars?category=Гран-туризмо" data-event="filter_change" data-event-label="discovery_grand_tourer"><Image src="/images/cars/bentley-continental/02.jpg" alt="Bentley Continental из каталога" fill sizes="(max-width:760px) 100vw, 34vw" /><span>03 / Gran Turismo</span><strong>Для долгой красивой дороги</strong><ArrowRight size={19} /></Link>
        </div>

        <div className="catalog-guide">
          <article><ListFilter size={20} /><div><strong>1. Сузьте выбор</strong><span>Используйте марку, категорию, кузов и класс.</span></div></article>
          <article><ScanSearch size={20} /><div><strong>2. Сравните карточки</strong><span>Оцените формат автомобиля, стоимость и фотографии.</span></div></article>
          <article><CircleDollarSign size={20} /><div><strong>3. Проверьте условия</strong><span>В карточке ставка и залог показаны отдельно.</span></div></article>
        </div>

        <CatalogClient cars={cars} availability={availability} initialCategory={params.category} initialMaxPrice={params.maxPrice ? Number(params.maxPrice) : undefined} period={{ start: start ?? undefined, end: end ?? undefined }} />

        <section className="catalog-help">
          <div><p className="eyebrow">Если выбор не очевиден</p><h2>Сравните несколько форматов</h2><p>Спортивное купе подходит не для каждого маршрута, а кроссовер не всегда нужен для короткой городской поездки. Откройте две-три карточки в близком бюджете и сравните сценарии, условия и залог.</p></div>
          <div className="button-row"><Link className="button" href="/services">Посмотреть сценарии аренды</Link><Link className="button ghost" href="/contacts">Задать вопрос</Link></div>
        </section>

        <section className="cta-panel catalog-cta"><div className="cta-content"><p className="eyebrow">После выбора</p><h2 className="title">Укажите период и оформите бронь</h2><p className="subtitle">Форма передаст автомобиль, даты и способ получения. Менеджер подтвердит доступность и финальные условия до договора.</p><div className="button-row"><Link className="button red" href="/booking">Перейти к оформлению <ArrowRight size={17} /></Link><Link className="button cta-secondary" href="/rental-terms">Условия аренды</Link></div></div></section>
      </div>
    </div>
  );
}
