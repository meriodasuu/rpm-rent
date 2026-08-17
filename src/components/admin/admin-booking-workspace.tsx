"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  Inbox,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { updateBookingStatusAction } from "@/app/admin/actions";
import {
  filterAdminBookings,
  getBookingAgeLabel,
  type AdminBookingFilter,
} from "@/lib/admin-operations";
import { allowedBookingTransitions, bookingStatusLabels } from "@/lib/domain/booking-status";
import { formatDateTime, formatDeposit, formatPrice, formatRentalDate, phoneHref } from "@/lib/format";
import type { Booking } from "@/types/domain";
import { BookingStatusBadge } from "./booking-status-badge";

const tabs: { value: AdminBookingFilter; label: string }[] = [
  { value: "attention", label: "В работе" },
  { value: "today", label: "Сегодня" },
  { value: "all", label: "Все" },
  { value: "CONFIRMED", label: "Подтверждены" },
  { value: "COMPLETED", label: "Завершены" },
];

function StatusSubmitButton() {
  const { pending } = useFormStatus();
  return <button className="admin-primary-action" type="submit" disabled={pending}>{pending ? "Сохраняем…" : "Изменить статус"}</button>;
}

export function AdminBookingWorkspace({
  bookings,
  initialFilter,
  initialBookingId,
  now,
}: {
  bookings: Booking[];
  initialFilter: AdminBookingFilter;
  initialBookingId?: string;
  now: string;
}) {
  const router = useRouter();
  const currentTime = useMemo(() => new Date(now), [now]);
  const [filter, setFilter] = useState<AdminBookingFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(initialBookingId);
  const deferredSearch = useDeferredValue(search);
  const filtered = useMemo(
    () => filterAdminBookings(bookings, filter, deferredSearch, currentTime),
    [bookings, currentTime, deferredSearch, filter],
  );
  const selected = bookings.find((item) => item.id === selectedId) ?? filtered[0] ?? bookings[0];

  const updateLocation = (nextFilter: AdminBookingFilter, bookingId?: string) => {
    const params = new URLSearchParams();
    if (nextFilter !== "attention") params.set("filter", nextFilter);
    if (bookingId) params.set("booking", bookingId);
    router.replace(`/admin/bookings${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  const chooseFilter = (nextFilter: AdminBookingFilter) => {
    setFilter(nextFilter);
    const first = filterAdminBookings(bookings, nextFilter, search, currentTime)[0];
    setSelectedId(first?.id);
    updateLocation(nextFilter, first?.id);
  };

  const chooseBooking = (bookingId: string) => {
    setSelectedId(bookingId);
    updateLocation(filter, bookingId);
  };

  return (
    <div className="admin-page admin-bookings-page">
      <div className="admin-container">
        <header className="admin-page-heading">
          <div>
            <p className="admin-kicker">Обращения клиентов</p>
            <h1>Обращения</h1>
            <p>Очередь, контакты и решение по бронированию в одном окне.</p>
          </div>
          <div className="admin-booking-total"><Inbox aria-hidden="true" size={17} /><strong>{bookings.length}</strong><span>всего</span></div>
        </header>

        <div className="admin-booking-toolbar">
          <div className="admin-booking-tabs" role="tablist" aria-label="Фильтры заявок">
            {tabs.map((tab) => {
              const count = filterAdminBookings(bookings, tab.value, "", currentTime).length;
              return (
                <button key={tab.value} role="tab" aria-selected={filter === tab.value} onClick={() => chooseFilter(tab.value)}>
                  {tab.label}<span>{count}</span>
                </button>
              );
            })}
          </div>
          <label className="admin-booking-search">
            <Search aria-hidden="true" size={17} />
            <span className="sr-only">Поиск по обращениям</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Имя, телефон, автомобиль…" />
          </label>
        </div>

        {bookings.length ? (
          <div className="admin-booking-workspace">
            <section className="admin-booking-list" aria-label="Список заявок">
              <div className="admin-booking-list-meta"><span>Найдено: {filtered.length}</span><span>Сначала новые</span></div>
              {filtered.length ? filtered.map((booking) => (
                <button
                  key={booking.id}
                  className={selected?.id === booking.id ? "is-selected" : undefined}
                  onClick={() => chooseBooking(booking.id)}
                  aria-pressed={selected?.id === booking.id}
                >
                  <span className="admin-booking-list-top"><strong>{booking.customerName}</strong><time>{getBookingAgeLabel(booking, currentTime)}</time></span>
                  <span className="admin-booking-list-contact">{booking.phone}</span>
                  <span className="admin-booking-list-car">{booking.carTitle}</span>
                  <span className="admin-booking-list-bottom"><span>{formatRentalDate(booking.startAt)} — {formatRentalDate(booking.endAt)}</span><BookingStatusBadge status={booking.status} /></span>
                </button>
              )) : (
                <div className="admin-booking-list-empty"><Search size={23} /><strong>Ничего не найдено</strong><span>Измените фильтр или поисковую фразу.</span></div>
              )}
            </section>

            {selected ? (
              <article className="admin-booking-detail">
                <header className="admin-booking-detail-header">
                  <div><span>Обращение · {formatDateTime(selected.createdAt)}</span><h2>{selected.customerName}</h2><small>{selected.id}</small></div>
                  <BookingStatusBadge status={selected.status} />
                </header>

                <div className="admin-contact-actions">
                  <a href={phoneHref(selected.phone)}><Phone size={17} /> Позвонить</a>
                  <a href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`} target="_blank"><MessageCircle size={17} /> WhatsApp</a>
                  {selected.telegram ? <a href={`https://t.me/${selected.telegram.replace(/^@/, "")}`} target="_blank"><ExternalLink size={17} /> Telegram</a> : null}
                </div>

                <div className="admin-booking-detail-grid">
                  <section>
                    <h3><CalendarDays size={16} /> Бронирование</h3>
                    <dl>
                      <div><dt>Автомобиль</dt><dd>{selected.carTitle}</dd></div>
                      <div><dt>Период</dt><dd>{formatRentalDate(selected.startAt)} — {formatRentalDate(selected.endAt)}</dd></div>
                      <div><dt>Длительность</dt><dd>{selected.rentalDays} сут.</dd></div>
                      <div><dt>Получение</dt><dd>{selected.pickupMethod === "delivery" ? "Доставка" : "В офисе"}</dd></div>
                      {selected.deliveryAddress ? <div><dt>Адрес</dt><dd>{selected.deliveryAddress}</dd></div> : null}
                    </dl>
                  </section>
                  <section>
                    <h3><UserRound size={16} /> Водитель</h3>
                    <dl>
                      <div><dt>Телефон</dt><dd>{selected.phone}</dd></div>
                      <div><dt>Возраст на начало</dt><dd>{selected.driverAgeAtStart !== null ? `${selected.driverAgeAtStart} лет` : "Уточнить"}</dd></div>
                      <div><dt>Стаж</dt><dd>{selected.drivingExperienceMonths !== null ? `${selected.drivingExperienceMonths} мес.` : "Уточнить"}</dd></div>
                      <div><dt>Дата рождения</dt><dd>{selected.birthDate ? formatRentalDate(selected.birthDate) : "Не указана"}</dd></div>
                    </dl>
                  </section>
                </div>

                <section className="admin-booking-price">
                  <div><span>Аренда</span><strong>{formatPrice(selected.rentalPrice)}</strong></div>
                  <div><span>Доп. услуги</span><strong>{formatPrice(selected.additionalServicesPrice)}</strong></div>
                  <div className="is-total"><span>Итого</span><strong>{formatPrice(selected.rentalPrice + selected.additionalServicesPrice)}</strong></div>
                  <div><span>Залог</span><strong>{formatDeposit(selected.deposit)}</strong></div>
                </section>

                {selected.additionalServicesSnapshot.length ? (
                  <section className="admin-booking-note"><h3>Дополнительные услуги</h3><p>{selected.additionalServicesSnapshot.map((service) => service.title).join(", ")}</p></section>
                ) : null}
                {selected.comment ? <section className="admin-booking-note"><h3>Комментарий клиента</h3><p>{selected.comment}</p></section> : null}
                <section className="admin-booking-note admin-booking-source"><h3>Источник</h3><p><MapPin size={14} /> {selected.source}{selected.referrer ? ` · ${selected.referrer}` : ""}</p></section>

                <footer className="admin-booking-decision">
                  <div><Clock3 size={17} /><span><strong>Следующий шаг</strong><small>Выберите новый статус обращения</small></span></div>
                  {allowedBookingTransitions[selected.status].length ? (
                    <form action={updateBookingStatusAction}>
                      <input type="hidden" name="id" value={selected.id} />
                      <input type="hidden" name="returnTo" value={`/admin/bookings?filter=${filter}&booking=${selected.id}`} />
                      <select name="status" defaultValue={allowedBookingTransitions[selected.status][0]}>
                        {allowedBookingTransitions[selected.status].map((status) => <option key={status} value={status}>{bookingStatusLabels[status]}</option>)}
                      </select>
                      <StatusSubmitButton />
                    </form>
                  ) : <span className="admin-booking-final"><Check size={16} /> Финальный статус</span>}
                </footer>
              </article>
            ) : null}
          </div>
        ) : (
          <div className="admin-panel admin-panel-empty"><Inbox size={28} /><strong>Обращений пока нет</strong><span>После отправки формы новое обращение появится здесь.</span></div>
        )}
      </div>
    </div>
  );
}
