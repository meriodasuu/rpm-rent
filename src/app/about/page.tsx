import { ArrowRight, CalendarDays, FileCheck2, Images, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = { title: "О RPM Rent", description: "Как устроен выбор автомобиля и оформление аренды в RPM Rent.", alternates: { canonical: "/about" } };

const principles = [
  { icon: Images, title: "Сначала реальный автомобиль", text: "Каталог построен вокруг фотографий конкретных машин, их формата и стоимости." },
  { icon: ListChecks, title: "Условия по каждой модели", text: "Ставка, залог и заполненные ограничения показаны до отправки заявки." },
  { icon: CalendarDays, title: "Период как часть выбора", text: "Даты передаются по всей воронке и проверяются повторно перед созданием заявки." },
  { icon: FileCheck2, title: "Подтверждение до договора", text: "Менеджер сверяет доступность и детали до оформления." }
];

export default function AboutPage() {
  return (
    <div className="page about-page"><div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О компании" }]} />
      <div className="surface about-panel about-panel-primary"><div className="about-copy"><h1 className="title">Подберем премиальное авто в аренду</h1><p className="subtitle">Вы увидите реальные фотографии, формат кузова, класс, ставку и залог, а затем сможете указать даты и способ получения.</p><Link className="about-link" href="/cars">Перейти к автопарку <ArrowRight size={16} /></Link></div><div className="about-image"><Image alt="Lamborghini Urus из каталога RPM Rent" fill sizes="(max-width:760px) 100vw, 55vw" src="/images/cars/lamborghini-urus/05.jpg" /></div></div>

      <section className="section"><div className="section-head section-head-copy"><div><h2 className="title">Что помогает принять решение</h2></div><p className="section-lead">Доверие складывается из реальных фотографий, понятного расчёта и условий конкретного автомобиля.</p></div><div className="fact-grid">{principles.map(({ icon: Icon, title, text }) => <article className="fact-card" key={title}><Icon size={21} /><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="section about-process"><div><h2 className="title">Заявка собирает всё необходимое</h2><p className="subtitle">Менеджер получает выбранный автомобиль, период, контакты, способ получения и дополнительные услуги.</p></div><div className="about-process-list"><article><span>01</span><div><h3>Выбор</h3><p>Клиент изучает каталог и подходящие автомобили.</p></div></article><article><span>02</span><div><h3>Запрос</h3><p>Указывает даты и передаёт данные для проверки.</p></div></article><article><span>03</span><div><h3>Согласование</h3><p>Менеджер подтверждает период, стоимость и условия.</p></div></article><article><span>04</span><div><h3>Оформление</h3><p>Согласованные параметры фиксируются до получения автомобиля.</p></div></article></div></section>

      <section className="section about-fleet"><div className="about-fleet-image"><Image alt="Bentley Continental GT из каталога RPM Rent" fill sizes="(max-width:760px) 100vw, 48vw" src="/images/cars/bentley-continental/01.jpg" /></div><div><h2 className="title">Автомобили для разных маршрутов</h2><p className="subtitle">Спортивные купе, кроссоверы, внедорожники, лифтбеки и гран-туризмо доступны для города, деловой программы, выходных или события.</p><div className="button-row"><Link className="button red" href="/cars">Смотреть автомобили</Link><Link className="button ghost" href="/services">Форматы аренды</Link></div></div></section>
    </div></div>
  );
}
