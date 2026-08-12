import { ArrowRight, CalendarDays, CircleDollarSign, FileCheck2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqList } from "@/components/faq-list";
import { getStore } from "@/lib/data";

export const metadata: Metadata = { title: "Вопросы об аренде", description: "Расчёт стоимости, проверка дат, залог, получение автомобиля и подтверждение заявки.", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const faqs = await (await getStore()).getFaqs();
  return (
    <div className="page faq-page"><div className="container">
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Вопросы и ответы" }]} />
      <div className="page-intro"><div><p className="eyebrow">Перед арендой</p><h1 className="title">Ответы на вопросы до заявки</h1></div><p className="subtitle">Здесь собраны общие правила процесса. Требования к возрасту, стажу, пробегу и страхованию зависят от конкретного автомобиля и публикуются в его карточке.</p></div>

      <div className="faq-guide"><article><CalendarDays size={20} /><h2>Даты</h2><p>Как проверяется период и когда автомобиль считается подтверждённым.</p></article><article><CircleDollarSign size={20} /><h2>Стоимость</h2><p>Как считается аренда, где виден залог и что добавляется отдельно.</p></article><article><FileCheck2 size={20} /><h2>Оформление</h2><p>Какие данные нужны и что происходит после отправки формы.</p></article></div>

      <section className="faq-main"><div><p className="eyebrow">Коротко и по делу</p><h2 className="title">Частые вопросы</h2><p className="subtitle">Если ответа недостаточно для вашей ситуации, выберите автомобиль и передайте вопрос вместе с датами. Так менеджер сможет проверить конкретные условия.</p><div className="button-row"><Link className="button" href="/cars">Выбрать автомобиль</Link><Link className="button ghost" href="/contacts">Задать вопрос</Link></div></div><FaqList items={faqs} /></section>

      <section className="cta-panel"><div className="cta-content"><p className="eyebrow">Не нашли ответ?</p><h2 className="title">Отправьте запрос по конкретному автомобилю</h2><p className="subtitle">Укажите модель, период и контакты. Мы проверим доступность и применимые условия до оформления.</p><div className="button-row"><Link className="button red" href="/booking">Перейти к заявке <ArrowRight size={17} /></Link><Link className="button cta-secondary" href="/rental-terms">Все условия</Link></div></div></section>
    </div></div>
  );
}
