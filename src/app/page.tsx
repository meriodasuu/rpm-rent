import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CarFront,
  Check,
  CircleDollarSign,
  FileText,
  KeyRound,
  MapPin,
  PackagePlus,
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
  ["Выбор авто", "Выберите автомобиль в каталоге или уточните наличие у менеджера.", CarFront, "/images/cars/drive/mercedes-gle/01.jpg"],
  ["Подходящая дата", "Укажите даты и время аренды. Мы проверим доступность автомобиля.", CalendarDays, "/images/cars/drive/porsche-taycan/02.jpg"],
  ["Подтверждение и бронирование", "Мы свяжемся с вами для уточнения всех деталей и брони.", ShieldCheck, "/images/cars/drive/tesla-black-2/01.jpg"],
  ["Договор и условия", "Подписываем договор и знакомим вас со всеми условиями. Всё прозрачно и безопасно.", FileText, "/images/cars/drive/porsche-macan/03.jpeg"],
  ["Получение авто", "Заберите автомобиль в удобное время и место. Наслаждайтесь поездкой!", KeyRound, "/images/cars/drive/jeep/01.jpg"]
] as const;

export default async function HomePage() {
  const store = await getStore();
  const [cars, services, faqs, locations] = await Promise.all([store.getCars(), store.getServices(), store.getFaqs(), store.getLocations()]);
  const homeFaqs = [
    ...faqs.slice(0, 5),
    {
      id: "faq-before-booking",
      question: "Что проверить перед оформлением?",
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
          <Image alt="Ночная дорога в Санкт-Петербурге" fill preload sizes="(max-width:760px) 100vw, 1280px" src="/images/atmosphere/rpm-night-road.png" />
          <div className="hero-grid" />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow">RPM Rent · Санкт-Петербург</p>
            <h1 className="display">Ваш маршрут<br />начинается здесь.</h1>
            <p className="subtitle">Премиальные автомобили для города, деловой поездки, события или долгого маршрута.</p>
            <div className="button-row"><Link className="button red" href="/cars">Выбрать автомобиль <ArrowRight size={18} /></Link></div>
          </div>
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
          <CarShowcase cars={cars.slice(0, 3)} />
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
            <div><h2 className="title">Выберите автомобиль<br />и проверьте даты</h2><div className="button-row"><Link className="button red" href="/cars">Смотреть каталог <ArrowRight size={18} /></Link><Link className="button ghost" href="/contacts"><Send size={17} /> Связаться с нами</Link></div></div>
            <Check aria-hidden className="compact-cta-check" size={68} />
          </div>
          <div className="compact-services" aria-label="Форматы аренды">
            {services.map((service, index) => { const Icon = serviceIcons[index % serviceIcons.length] ?? KeyRound; return <Link href={`/booking?service=${service.slug}`} key={service.id}><span><Icon size={18} /></span><strong>{service.title}</strong></Link>; })}
          </div>
        </div>
      </section>

      <section className="section section-contrast steps-editorial-section">
        <div className="container steps-cards-section">
          <div className="steps-cards-heading"><h2 className="title">Пять<br />понятных<br /><span>шагов</span></h2><p>Аренда автомобиля премиум-класса — просто, быстро и без лишних сложностей.</p></div>
          <ol className="steps-cards">{steps.map(([title, text, Icon, image], index) => <li key={title}><div className="step-card-top"><span>{String(index + 1).padStart(2, "0")}</span><Icon size={18} /></div><h3>{title}</h3><p>{text}</p><div className="step-card-image"><Image alt="" fill sizes="(max-width:760px) 78vw, 20vw" src={image} /></div></li>)}</ol>
          <div className="route-chip-row steps-routes">{ROUTE_CATEGORIES.map(({ label, href, icon }) => { const Icon = routeIcons[icon]; return <Link className="route-chip" href={href} key={label}><Icon size={16} />{label}</Link>; })}</div>
        </div>
      </section>

      <section className="section price-section">
        <div className="container price-layout">
          <div><h2 className="title">Из чего складывается<br />предварительный расчёт</h2><p className="price-intro">До оформления вы увидите прозрачную структуру стоимости без скрытых пунктов.</p><div className="button-row"><Link className="button ghost" href="/rental-terms">Подробнее об условиях</Link></div></div>
          <div className="price-example surface"><p className="price-example-label">Пример структуры расчёта</p><div className="price-line"><span><CarFront size={17} />Ставка автомобиля</span><strong>за сутки</strong></div><div className="price-line"><span><CalendarDays size={17} />Срок аренды</span><strong>выбранные даты</strong></div><div className="price-line"><span><PackagePlus size={17} />Дополнительные услуги</span><strong>если выбраны</strong></div><div className="price-line price-line-total"><span><CircleDollarSign size={17} />Залог</span><strong>отдельно</strong></div><p>Конкретные суммы указаны в карточке автомобиля и сводке оформления.</p></div>
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
