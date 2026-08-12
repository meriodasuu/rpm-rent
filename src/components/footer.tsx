import Link from "next/link";
import { CONTACTS } from "@/lib/site-content";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-statement">
          <strong>Ваш маршрут<br />начинается здесь.</strong>
        </div>
        <div className="footer-grid">
          <div className="footer-brand"><Logo /><p className="muted small">Премиальные автомобили в Санкт-Петербурге. Выберите модель и даты. Менеджер подтвердит доступность и условия.</p><Link className="footer-cta" href="/cars">Выбрать автомобиль</Link></div>
          <div className="footer-column"><h3>Выбор</h3><Link href="/cars">Каталог автомобилей</Link><Link href="/services">Форматы аренды</Link><Link href="/booking">Оформить аренду</Link></div>
          <div className="footer-column"><h3>Информация</h3><Link href="/rental-terms">Условия аренды</Link><Link href="/faq">Вопросы и ответы</Link><Link href="/about">О RPM Rent</Link><Link href="/privacy">Политика конфиденциальности</Link></div>
          <div className="footer-column"><h3>Контакты</h3><a href={CONTACTS.phoneHref}>{CONTACTS.phone}</a><a href={CONTACTS.max.href}>MAX · {CONTACTS.max.phone}</a><a href={CONTACTS.socials.find((item) => item.label === "Telegram")?.href} rel="noreferrer" target="_blank">Telegram</a><span>{CONTACTS.address}</span></div>
        </div>
        <div className="footer-bottom"><span>© RPM Rent, {new Date().getFullYear()}</span><span>Бронирование подтверждает менеджер.</span></div>
      </div>
    </footer>
  );
}
