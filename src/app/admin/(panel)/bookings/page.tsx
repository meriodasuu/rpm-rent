import { updateBookingStatusAction } from "@/app/admin/actions";
import { getStore } from "@/lib/data";
import { allowedBookingTransitions, bookingStatusLabels } from "@/lib/domain/booking-status";
import { formatDateTime, formatPrice, formatRentalDate } from "@/lib/format";

export const metadata = { title: "Заявки" };

export default async function AdminBookingsPage() {
  const bookings = await (await getStore()).getBookings();
  return (
    <div className="admin-page">
      <div className="container">
        <p className="eyebrow">Обращения клиентов</p>
        <h1 className="admin-title">Заявки</h1>
        <p className="muted">Возраст, стаж, применённые требования и цены ниже зафиксированы на момент отправки. Последующее редактирование автомобиля их не меняет.</p>
        {bookings.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Создана</th><th>Клиент и водитель</th><th>Автомобиль</th><th>Период</th><th>Снимок стоимости</th><th>Источник</th><th>Статус</th></tr></thead>
              <tbody>
                {bookings.map((booking) => {
                  const nextStatuses = allowedBookingTransitions[booking.status];
                  return (
                    <tr key={booking.id}>
                      <td>{formatDateTime(booking.createdAt)}<div className="muted">{booking.id}</div></td>
                      <td>
                        <strong>{booking.customerName}</strong><div>{booking.phone}</div><div className="muted">{booking.telegram}</div>
                        <div className="muted">Рождение: {booking.birthDate ? formatRentalDate(booking.birthDate) : "legacy: нет"}</div>
                        <div className="muted">Права: {booking.licenseIssuedOn ? formatRentalDate(booking.licenseIssuedOn) : "legacy: нет"}</div>
                        <div className="muted">На начало: {booking.driverAgeAtStart ?? "не указан"} лет, стаж {booking.drivingExperienceMonths} мес.</div>
                      </td>
                      <td>{booking.carTitle}<div className="muted">Требования: возраст {booking.minimumAgeApplied ?? "legacy"}, стаж {booking.minimumDrivingExperienceApplied ?? "legacy"} мес., срок {booking.minimumRentalDaysApplied ?? "legacy"} сут.</div></td>
                      <td>{formatRentalDate(booking.startAt)}<br />по {formatRentalDate(booking.endAt)}<div className="muted">{booking.rentalDays} сут.</div></td>
                      <td>
                        {formatPrice(booking.rentalPrice + booking.additionalServicesPrice)}
                        <div className="muted">ставка {formatPrice(booking.pricePerDaySnapshot)} / сут.</div>
                        <div className="muted">услуги {formatPrice(booking.additionalServicesPrice)}</div>
                        <div className="muted">залог {formatPrice(booking.deposit)}</div>
                      </td>
                      <td>{booking.source}<div className="muted">Согласие: {booking.privacyConsentAt ? formatDateTime(booking.privacyConsentAt) : "legacy: нет"}</div></td>
                      <td>
                        <strong>{bookingStatusLabels[booking.status]}</strong>
                        {nextStatuses.length ? (
                          <form action={updateBookingStatusAction}>
                            <input type="hidden" name="id" value={booking.id} />
                            <select className="status-select" name="status" defaultValue={nextStatuses[0]}>
                              {nextStatuses.map((status) => <option key={status} value={status}>{bookingStatusLabels[status]}</option>)}
                            </select>
                            <button className="button ghost small-button" type="submit" style={{ marginTop: 6 }}>Изменить статус</button>
                          </form>
                        ) : <div className="muted">Финальный статус</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="surface empty-state"><h2>Заявок пока нет</h2><p className="muted">После отправки формы заявка появится здесь.</p></div>}
      </div>
    </div>
  );
}
