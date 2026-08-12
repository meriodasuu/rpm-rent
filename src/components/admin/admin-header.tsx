import Link from "next/link";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/app/admin/actions";

export function AdminHeader({ email }: { email: string }) {
  return <header className="admin-header"><div className="container admin-header-inner"><Logo /><nav className="admin-nav"><Link href="/admin">Обзор</Link><Link href="/admin/cars">Автомобили</Link><Link href="/admin/bookings">Заявки</Link><Link href="/admin/content">Контент</Link><Link href="/" target="_blank">Открыть сайт</Link></nav><form action={logoutAction}><button className="button ghost small-button" type="submit" title={email}>Выйти</button></form></div></header>;
}
