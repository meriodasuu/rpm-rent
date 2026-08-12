import { notFound } from "next/navigation";
import { CarForm } from "@/components/admin/car-form";
import { deleteCarAction } from "@/app/admin/actions";
import { getStore } from "@/lib/data";

export default async function EditCarPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const car = await (await getStore()).getCarById(id);
  if (!car) notFound();
  return <div className="admin-page"><div className="container"><p className="eyebrow">Каталог</p><h1 className="admin-title">{car.title}</h1>{query.saved ? <p className="tag" style={{ marginBottom: 18 }}>Изменения сохранены</p> : null}<CarForm car={car} /><div className="surface admin-form" style={{ marginTop: 22 }}><h2>Удалить автомобиль</h2><p className="muted">Удаление необратимо. Для временного снятия с сайта используйте флаг «Опубликован».</p><form action={deleteCarAction} className="button-row"><input type="hidden" name="id" value={car.id} /><input className="input" style={{ width: 220 }} name="confirmation" placeholder="Введите УДАЛИТЬ" /><button className="button red" type="submit">Удалить</button></form></div></div></div>;
}
