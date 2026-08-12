import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CarFront,
  Check,
  KeyRound,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CarShowcase } from "@/components/car-showcase";
import { FaqList } from "@/components/faq-list";
import { getStore } from "@/lib/data";
import { ROUTE_CATEGORIES } from "@/lib/site-content";

const routeIcons = {
  city: CarFront,
  business: BriefcaseBusiness,
  event: Sparkles,
  long: CalendarDays
} as const;

const serviceIcons = [CarFront, CalendarDays, ShieldCheck, MapPin, Sparkles, Camera] as const;

const steps = [
  ["Выбор авто", "Сравните реальные фотографии и характеристики."],
  ["Подходящая дата", "Укажите начало и окончание поездки."],
  ["Детали аренды", "Передайте контакты и способ получения."],
  ["Согласование", "Менеджер подтвердит доступность и финальные условия."],
  ["Получение авто", "Зафиксируйте договорённости и заберите автомобиль."]
] as const;

export default async function HomePage() {
  const store = await getStore();
  const [cars, services, faqs, locations] = await Promise.all([store.getCars(), store.getServices(), store.getFaqs(), store.getLocations()]);
  const hero = cars.find((car) => car.slug === "porsche-911-carrera-4s") ?? cars[0];
  const homeFaqs = [
    ...faqs.slice(0, 5),
    {
      id: "faq-before-request",
      question: "Что проверить перед заявкой?",
      answer: "Суточную ставку и залог, доступность на нужные даты, требования к возрасту и стажу, лимит пробега, страхование, способ получения и возврата.",
      category: "rental",
      published: true,
      sortOrder: 99
    }
  ];

  return (
    <>
      <section className="hero hero-cinematic home-hero">
        <div className="container hero-card">
          <div className="hero-grid" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow">RPM Rent · Санкт-Петербург</p>
            <h1 className="display">Петербург.<br />Ваш темп.</h1>
            <p className="subtitle">Премиальные автомобили для вашего маршрута. Выберите модель, даты и формат поездки.</p>
            <div className="button-row"><Link className="button red" href="/cars">Выбрать автомобиль <ArrowRight size={18} /></Link></div>
          </div>
          {hero?.images[0] ? <div className="hero-car"><Image alt={hero.images[0].alt} fill preload sizes="(max-width:760px) 100vw,70vw" src={hero.images[0].url} /></div> : null}
        </div>
      </section>

      <section className="section section-product" id="cars">
        <div className="container">
          <div className="section-head fleet-heading">
            <h2 className="title">Автомобили<br /><span>для разных маршрутов</span></h2>
            <div className="route-chip-row" aria-label="Категории автомобилей">
              {ROUTE_CATEGORIES.slice(0, 3).map(({ label, href, icon }) => {
                const Icon = routeIcons[icon];
                return <Link className="route-chip" href={href} key={label}><Icon size={16} />{label}</Link>;
              })}
            </div>
          </div>
          <CarShowcase cars={cars.slice(0, 8)} />
          <div className="section-action"><Link className="button ghost" href="/cars">Смотреть все автомобили <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      <section className="city-chapter">
        <Image alt="Набережная Санкт-Петербурга после дождя" fill sizes="100vw" src="/images/atmosphere/saint-petersburg-blue-hour.png" />
        <div className="city-chapter-shade" />
        <div className="container city-chapter-content">
          <p className="eyebrow">Дворцовая набережная</p>
          <h2 className="display">Город задаёт<br />маршрут.</h2>
          <div className="city-chapter-note"><p>Атмосфера Петербурга задаёт настроение. В автопарке представлены реальные машины RPM Rent.</p></div>
        </div>
      </section>

      <section className="section locations-section">
        <div className="container">
          <div className="section-head"><h2 className="title">Локации</h2><p className="section-lead">Выберите настроение поездки и перейдите к подходящей подборке.</p></div>
          <div className="locations-grid">
            {locations.map((location, index) => <Link className="location-card" href={`/locations/${location.slug}`} key={location.id}><Image alt={location.title} fill sizes="(max-width:760px) 88vw, 42vw" src={location.image} /><span className="location-shade" /><span className="location-index">{String(index + 1).padStart(2, "0")}</span><span className="location-copy"><small>{location.subtitle}</small><strong>{location.title}</strong></span><ArrowRight size={20} /></Link>)}
          </div>
        </div>
      </section>

      <section className="section compact-rental-section">
        <div className="container">
          <div className="compact-cta">
            <div><h2 className="title">Выберите автомобиль<br />и проверьте даты</h2><div className="button-row"><Link className="button red" href="/cars">Смотреть каталог <ArrowRight size={18} /></Link><Link className="button ghost" href="/contacts"><Send size={17} /> Уточнить вопрос</Link></div></div>
            <Check aria-hidden className="compact-cta-check" size={68} />
          </div>
          <div className="compact-services" aria-label="Форматы аренды">
            {services.map((service, index) => { const Icon = serviceIcons[index % serviceIcons.length] ?? KeyRound; return <Link href={`/booking?service=${service.slug}`} key={service.id}><span><Icon size={18} /></span><strong>{service.title}</strong></Link>; })}
          </div>
        </div>
      </section>

      <section className="section section-contrast steps-editorial-section">
        <div className="container steps-editorial">
          <div className="steps-title-wrap"><h2 className="title">Пять<br />понятных шагов</h2><span aria-hidden>5</span></div>
          <ol className="steps-editorial-list">{steps.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}</ol>
          <div className="route-chip-row steps-routes">{ROUTE_CATEGORIES.map(({ label, href, icon }) => { const Icon = routeIcons[icon]; return <Link className="route-chip" href={href} key={label}><Icon size={16} />{label}</Link>; })}</div>
        </div>
      </section>

      <section className="section price-section">
        <div className="container price-layout">
          <div><h2 className="title">Из чего складывается<br />предварительный расчёт</h2><div className="button-row"><Link className="button ghost" href="/rental-terms">Подробнее об условиях</Link></div></div>
          <div className="price-example surface"><span className="price-orbit" aria-hidden /><p className="price-example-label">Пример структуры расчёта</p><div className="price-line"><span>Ставка автомобиля</span><strong>за сутки</strong></div><div className="price-line"><span>Срок аренды</span><strong>выбранные даты</strong></div><div className="price-line"><span>Дополнительные услуги</span><strong>если выбраны</strong></div><div className="price-line price-line-total"><span>Залог</span><strong>отдельно</strong></div><p>Конкретные суммы указаны в карточке автомобиля и сводке оформления.</p></div>
        </div>
      </section>

      <section className="section faq-home-section">
        <div className="container grid-2 faq-home"><div><h2 className="title">Главное<br />об аренде</h2><div className="button-row"><Link className="button ghost" href="/faq">Все вопросы</Link><Link className="button" href="/contacts">Уточнить вопрос</Link></div></div><FaqList items={homeFaqs} /></div>
      </section>

      <section className="section home-final-cta">
        <div className="container cta-panel"><div className="cta-content"><h2 className="title">Ваш автомобиль<br />уже в каталоге</h2><div className="button-row"><Link className="button red" href="/cars">Перейти к автопарку <ArrowRight size={18} /></Link></div></div></div>
      </section>
    </>
  );
}
