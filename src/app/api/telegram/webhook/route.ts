import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { answerTelegramCallbackQuery, bookingDetailsReplyMarkup, formatBookingDetails, formatBookingSummary, sendTelegramMessage } from "@/lib/telegram";
import { bookingStatusLabels } from "@/lib/domain/booking-status";
import type { Booking, BookingStatus } from "@/types/domain";

type TelegramUpdate = {
  message?: {
    text?: unknown;
    chat?: { id?: unknown };
    from?: { id?: unknown; username?: unknown };
  };
  callback_query?: {
    id?: unknown;
    data?: unknown;
    from?: { id?: unknown; username?: unknown };
    message?: { chat?: { id?: unknown } };
  };
};

const matchesSecret = (received: string | null, expected: string | undefined) => {
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

const helpText = "Команды:\n/new — новые заявки\n/bookings — журнал заявок\n/find <номер, телефон или имя> — поиск заявок\n/booking <номер> — полная карточка заявки, например /booking 123";
const adminHelpText = `${helpText}\n/allow @username — дать сотруднику доступ`;
const usernamePattern = /^@?([a-zA-Z0-9_]{5,32})$/;
const bookingStatuses: readonly BookingStatus[] = ["NEW", "IN_PROGRESS", "CONFIRMED", "DECLINED", "CANCELLED", "COMPLETED"];
const pageSize = 10;
const historyPeriods = ["7", "30", "all"] as const;
type HistoryPeriod = typeof historyPeriods[number];
type HistoryStatus = BookingStatus | "ALL";

const bootstrapAdminUsernames = () => (process.env.TELEGRAM_BOOTSTRAP_ADMINS ?? "")
  .split(",").map((username) => username.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);

const bookingNumberFromCommand = (text: string) => text.match(/^\/booking\s+(\d+)$/)?.[1];
const findBookingByNumber = (bookings: Booking[], number: string) => bookings.find((booking) => booking.bookingNumber === Number(number));
const historyStatusFromValue = (value: string): HistoryStatus | null => value === "ALL" || bookingStatuses.includes(value as BookingStatus) ? value as HistoryStatus : null;
const historyPeriodFromValue = (value: string): HistoryPeriod | null => historyPeriods.includes(value as HistoryPeriod) ? value as HistoryPeriod : null;

const historyReplyMarkup = (status: HistoryStatus, period: HistoryPeriod, page: number, totalPages: number) => ({
  inline_keyboard: [
    [{ text: "Все", callback_data: `bookings:ALL:${period}:0` }, { text: "Новые", callback_data: `bookings:NEW:${period}:0` }, { text: "В работе", callback_data: `bookings:IN_PROGRESS:${period}:0` }],
    [{ text: "Подтверждённые", callback_data: `bookings:CONFIRMED:${period}:0` }, { text: "Отклонённые", callback_data: `bookings:DECLINED:${period}:0` }, { text: "Отменённые", callback_data: `bookings:CANCELLED:${period}:0` }],
    [{ text: "Завершённые", callback_data: `bookings:COMPLETED:${period}:0` }],
    [{ text: "7 дней", callback_data: `bookings:${status}:7:0` }, { text: "30 дней", callback_data: `bookings:${status}:30:0` }, { text: "Всё время", callback_data: `bookings:${status}:all:0` }],
    ...(totalPages > 1 ? [[
      ...(page > 0 ? [{ text: "← Назад", callback_data: `bookings:${status}:${period}:${page - 1}` }] : []),
      { text: `${page + 1}/${totalPages}`, callback_data: "history:noop" },
      ...(page + 1 < totalPages ? [{ text: "Вперёд →", callback_data: `bookings:${status}:${period}:${page + 1}` }] : [])
    ]] : [])
  ]
});

const historyLabel = (status: HistoryStatus) => status === "ALL" ? "Все" : bookingStatusLabels[status];
const periodLabel = (period: HistoryPeriod) => period === "all" ? "Всё время" : `${period} дней`;

const filterHistoryBookings = (bookings: Booking[], status: HistoryStatus, period: HistoryPeriod) => {
  const cutoff = period === "all" ? null : Date.now() - Number(period) * 24 * 60 * 60 * 1000;
  return bookings.filter((booking) => status === "ALL" || booking.status === status)
    .filter((booking) => cutoff === null || new Date(booking.createdAt).getTime() >= cutoff);
};

const sendBookingHistory = async (recipient: string, bookings: Booking[], status: HistoryStatus, period: HistoryPeriod, requestedPage = 0) => {
  const filtered = filterHistoryBookings(bookings, status, period);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(Math.max(requestedPage, 0), totalPages - 1);
  const pageBookings = filtered.slice(page * pageSize, (page + 1) * pageSize);
  await sendTelegramMessage(recipient, `Заявки · ${historyLabel(status)} · ${periodLabel(period)}${filtered.length ? `\nНайдено: ${filtered.length}` : "\nЗаявок не найдено."}`, {
    replyMarkup: historyReplyMarkup(status, period, page, totalPages)
  });
  for (const booking of pageBookings) {
    await sendTelegramMessage(recipient, formatBookingSummary(booking), { replyMarkup: bookingDetailsReplyMarkup(booking) });
  }
};

const searchBookings = (bookings: Booking[], query: string) => {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
  const phoneQuery = normalizedQuery.replace(/\D/g, "");
  return bookings.filter((booking) =>
    String(booking.bookingNumber) === normalizedQuery
    || (phoneQuery.length > 0 && booking.phone.replace(/\D/g, "").includes(phoneQuery))
    || booking.customerName.toLocaleLowerCase("ru-RU").includes(normalizedQuery)
  ).slice(0, pageSize);
};

export async function POST(request: NextRequest) {
  if (!matchesSecret(request.headers.get("x-telegram-bot-api-secret-token"), process.env.TELEGRAM_WEBHOOK_SECRET)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json() as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const callback = update.callback_query;
  const message = update.message;
  const userId = callback?.from?.id ?? message?.from?.id;
  const chatId = callback?.message?.chat?.id ?? message?.chat?.id;
  const text = message?.text;
  const username = callback?.from?.username ?? message?.from?.username;
  if (typeof userId !== "number" || (typeof chatId !== "number" && typeof chatId !== "string")) {
    return NextResponse.json({ ok: true });
  }

  const recipient = String(chatId);
  const store = await getStore();
  if (callback) {
    const callbackId = typeof callback.id === "string" ? callback.id : "";
    const callbackData = typeof callback.data === "string" ? callback.data : "";
    const operator = await store.getTelegramOperatorByUserId(String(userId));
    if (!operator) return NextResponse.json({ ok: false }, { status: 403 });
    await answerTelegramCallbackQuery(callbackId);
    const historyMatch = callbackData.match(/^bookings:([A-Z_]+|ALL):(7|30|all):(\d+)$/);
    if (historyMatch) {
      const status = historyStatusFromValue(historyMatch[1] ?? "");
      const period = historyPeriodFromValue(historyMatch[2] ?? "");
      if (status && period) await sendBookingHistory(recipient, await store.getBookings(), status, period, Number(historyMatch[3] ?? 0));
      return NextResponse.json({ ok: true });
    }
    const number = callbackData.match(/^booking:(\d+)$/)?.[1];
    if (!number) return NextResponse.json({ ok: true });
    const booking = findBookingByNumber(await store.getBookings(), number);
    await sendTelegramMessage(recipient, booking ? formatBookingDetails(booking, "Заявка") : "Заявка не найдена.");
    return NextResponse.json({ ok: true });
  }
  if (typeof text !== "string") return NextResponse.json({ ok: true });
  const normalized = text.trim();
  if (normalized === "/start") {
    const usernameFromTelegram = typeof username === "string" ? username.match(usernamePattern)?.[1] : undefined;
    const operator = usernameFromTelegram ? await store.activateTelegramOperator({
      telegramUserId: String(userId), username: usernameFromTelegram.toLowerCase(), bootstrapAdminUsernames: bootstrapAdminUsernames()
    }) : null;
    await sendTelegramMessage(recipient, operator
      ? `Доступ активирован. ${operator.role === "ADMIN" ? "Администратор." : "Сотрудник."}\n${operator.role === "ADMIN" ? adminHelpText : helpText}`
      : "Доступ не выдан. Попросите администратора добавить ваш @username через /allow.");
    return NextResponse.json({ ok: true });
  }

  const operator = await store.getTelegramOperatorByUserId(String(userId));
  if (!operator) return NextResponse.json({ ok: false }, { status: 403 });
  if (normalized === "/help") {
    await sendTelegramMessage(recipient, operator.role === "ADMIN" ? adminHelpText : helpText);
    return NextResponse.json({ ok: true });
  }
  const allowMatch = normalized.match(/^\/allow\s+(@?[a-zA-Z0-9_]{5,32})$/);
  if (allowMatch) {
    if (operator.role !== "ADMIN") return NextResponse.json({ ok: false }, { status: 403 });
    const invitedUsername = (allowMatch[1] ?? "").replace(/^@/, "").toLowerCase();
    await store.inviteTelegramOperator({ username: invitedUsername });
    await sendTelegramMessage(recipient, `@${invitedUsername} добавлен. Пусть пользователь напишет боту /start для активации доступа.`);
    return NextResponse.json({ ok: true });
  }
  if (normalized === "/new") {
    const bookings = (await store.getBookings()).filter((booking) => booking.status === "NEW").slice(0, 10);
    if (!bookings.length) {
      await sendTelegramMessage(recipient, "Новых заявок нет.");
      return NextResponse.json({ ok: true });
    }
    await sendTelegramMessage(recipient, "Новые заявки:");
    for (const booking of bookings) {
      await sendTelegramMessage(recipient, formatBookingSummary(booking), { replyMarkup: bookingDetailsReplyMarkup(booking) });
    }
    return NextResponse.json({ ok: true });
  }

  const historyMatch = normalized.match(/^\/bookings(?:\s+(ALL|NEW|IN_PROGRESS|CONFIRMED|DECLINED|CANCELLED|COMPLETED))?$/);
  if (historyMatch) {
    await sendBookingHistory(recipient, await store.getBookings(), historyStatusFromValue(historyMatch[1] ?? "ALL")!, "all");
    return NextResponse.json({ ok: true });
  }

  const findMatch = normalized.match(/^\/find\s+(.+)$/);
  if (findMatch) {
    const bookings = searchBookings(await store.getBookings(), findMatch[1] ?? "");
    if (!bookings.length) {
      await sendTelegramMessage(recipient, "Заявки не найдены.");
      return NextResponse.json({ ok: true });
    }
    await sendTelegramMessage(recipient, `Найдено заявок: ${bookings.length}`);
    for (const booking of bookings) {
      await sendTelegramMessage(recipient, formatBookingSummary(booking), { replyMarkup: bookingDetailsReplyMarkup(booking) });
    }
    return NextResponse.json({ ok: true });
  }

  const bookingNumber = bookingNumberFromCommand(normalized);
  if (bookingNumber) {
    const booking = findBookingByNumber(await store.getBookings(), bookingNumber);
    await sendTelegramMessage(recipient, booking ? formatBookingDetails(booking, "Заявка") : "Заявка не найдена.");
    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage(recipient, operator.role === "ADMIN" ? adminHelpText : helpText);
  return NextResponse.json({ ok: true });
}
