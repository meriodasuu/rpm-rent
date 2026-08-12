import { ArrowRight, CalendarDays, CarFront, Check, CircleDollarSign, FileCheck2, MapPin, ShieldCheck, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = { title: "Условия аренды автомобилей", description: "Как выбрать автомобиль, проверить даты, рассчитать стоимость и оформить аренду.", alternates: { canonical: "/rental-terms" } };

const checks = [
  { icon: UserRound, title: "Требования к водителю", text: "Минимальный возраст и стаж зависят от автомобиля." },
  { icon: CircleDollarSign, title: "Стоимость и залог", text: "Суточная ставка участвует в расчёте. Залог показан отдельно." },
  { icon: ShieldCheck, title: "Пробег и страхование", text: "Лимит, перепробег и страхование зависят от конкретной машины." },
  { icon: MapPin, title: "Получение и возврат", text: "Самовывоз или доставка согласуются с менеджером." }
];

const flow = [
  { icon: CarFront, title: "Выберите автомобиль", text: "Сравните фотографии, кузов, класс, суточную ставку и залог." },
  { icon: CalendarDays, title: "Укажите период", text: "Каталог проверит пересечения, затем сервер повторит проверку при отправке." },
  { icon: CircleDollarSign, title: "Посмотрите расчёт", text: "Аренда считается по ставке и длительности. Услуги и залог показаны отдельно." },
  { icon: FileCheck2, title: "Получите подтверждение", text: "Менеджер проверит доступность, требования и способ получения." }
];

export default function RentalTermsPage() {
  return (
    <div className="page terms-page"><div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Условия аренды" }]} />
      <div className="page-intro"><div><h1 className="title">Как устроены условия аренды</h1></div><p className="subtitle">Конкретные ограничения, ставка и залог зависят от выбранного автомобиля и подтверждаются до оформления.</p></div>

      <div className="terms-summary">{checks.map(({ icon: Icon, title, text }) => <article key={title}><Icon size={21} /><h2>{title}</h2><p>{text}</p></article>)}</div>

      <section className="section terms-flow terms-flow-vertical"><div><h2 className="title">От каталога до подтверждения</h2></div><ol className="terms-flow-list">{flow.map(({ icon: Icon, title, text }, index) => <li key={title}><span><Icon size={19} /></span><div><h3>{index + 1}. {title}</h3><p>{text}</p></div></li>)}</ol></section>

      <section className="section terms-details"><div><h2 className="title">Что проверить перед оформлением</h2></div><div className="condition-checklist surface">{["Суточная ставка", "Размер залога", "Минимальный срок", "Возраст и водительский стаж", "Лимит пробега", "Страхование", "Доставка или самовывоз"].map((item) => <div className="check-row" key={item}><Check size={17} /><span>{item}</span></div>)}</div></section>

      <section className="terms-notice surface"><FileCheck2 size={24} /><div><h2>Бронь подтверждает менеджер</h2><p>Менеджер проверит выбранный автомобиль, даты и условия до оформления договора.</p></div></section>

      <section className="section"><div className="cta-panel"><div className="cta-content"><h2 className="title">Сравните автомобили и их условия</h2><div className="button-row"><Link className="button red" href="/cars">Перейти в каталог <ArrowRight size={18} /></Link><Link className="button cta-secondary" href="/faq">Частые вопросы</Link></div></div></div></section>
    </div></div>
  );
}
