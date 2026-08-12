import Link from "next/link";
import { getStore } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Автомобили" };

export default async function AdminCarsPage() {
  const cars = await (await getStore()).getCars({ includeHidden: true });
  return <div className="admin-page"><div className="container"><div className="section-head"><div><p className="eyebrow">Единый источник данных</p><h1 className="admin-title" style={{ margin: 0 }}>Автомобили</h1></div><Link className="button red" href="/admin/cars/new">Добавить автомобиль</Link></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Автомобиль</th><th>Цена</th><th>Наличие</th><th>Публикация</th><th>Данные</th><th /></tr></thead><tbody>{cars.map((car) => <tr key={car.id}><td><strong>{car.title}</strong><div className="muted small">/{car.slug}</div></td><td>{formatPrice(car.pricePerDay)}</td><td>{car.available ? "Доступен" : "Недоступен"}</td><td>{car.published ? "Опубликован" : "Скрыт"}</td><td>{car.isDemo ? <span className="tag red">Demo</span> : <span className="tag">Проверены</span>}</td><td><Link className="button ghost small-button" href={`/admin/cars/${car.id}`}>Редактировать</Link></td></tr>)}</tbody></table></div></div></div>;
}
