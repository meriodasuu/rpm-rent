import { AdminBookingWorkspace } from "@/components/admin/admin-booking-workspace";
import { getStore } from "@/lib/data";
import { parseAdminBookingFilter } from "@/lib/admin-operations";

export const metadata = { title: "Заявки" };

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; booking?: string }>;
}) {
  const [bookings, query] = await Promise.all([
    (await getStore()).getBookings(),
    searchParams,
  ]);

  return (
    <AdminBookingWorkspace
      bookings={bookings}
      initialFilter={parseAdminBookingFilter(query.filter)}
      initialBookingId={query.booking}
      now={new Date().toISOString()}
    />
  );
}
