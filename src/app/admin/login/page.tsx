import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getAdminSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Вход в панель управления", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <div className="admin-login"><div className="surface login-card"><Logo /><h1>Панель управления</h1><p className="muted">Доступ только для администратора RPM Rent.</p><LoginForm /><p className="muted small" style={{ marginTop: 22 }}>Локальные реквизиты находятся в игнорируемом файле .env.local.</p></div></div>;
}
