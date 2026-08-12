import Link from "next/link";
import { getStore } from "@/lib/data";

export default async function AdminDashboard() {
  const store = await getStore();
  const [cars, bookings, services, faqs] = await Promise.all([store.getCars({ includeHidden: true }), store.getBookings(), store.getServices({ includeHidden: true }), store.getFaqs({ includeHidden: true })]);
  return <div className="admin-page"><div className="container"><p className="eyebrow">RPM Rent</p><h1 className="admin-title">Панель управления</h1><div className="admin-stat-grid"><div className="surface admin-stat"><strong>{cars.length}</strong><span>автомобилей</span></div><div className="surface admin-stat"><strong>{bookings.filter((item) => item.status === "NEW").length}</strong><span>новых заявок</span></div><div className="surface admin-stat"><strong>{services.length}</strong><span>услуг</span></div><div className="surface admin-stat"><strong>{faqs.length}</strong><span>вопросов FAQ</span></div></div><div className="grid-3" style={{ marginTop: 22 }}><Link className="surface content-card" href="/admin/cars"><h2>Автомобили</h2><p className="muted">Цены, доступность, публикация, фото и SEO.</p></Link><Link className="surface content-card" href="/admin/bookings"><h2>Заявки</h2><p className="muted">Клиент, период, стоимость, источник и статус.</p></Link><Link className="surface content-card" href="/admin/content"><h2>Контент</h2><p className="muted">Услуги и вопросы FAQ без изменения кода.</p></Link></div></div></div>;
}
