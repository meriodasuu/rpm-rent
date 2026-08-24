import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/data";
import { answerTelegramCallbackQuery, bookingDetailsReplyMarkup, formatBookingDetails, formatBookingSummary, sendTelegramMessage } from "@/lib/telegram";
import type { Booking } from "@/types/domain";

type TelegramUpdate = {
  message?: { text?: unknown; chat?: { id?: unknown }; from?: { id?: unknown; username?: unknown } };
  callback_query?: { id?: unknown; data?: unknown; from?: { id?: unknown }; message?: { chat?: { id?: unknown } } };
};

const matchesSecret = (received: string | null, expected: string | undefined) => {
  if (!received || !expected) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};
const helpText = "Команды:\n/new — новые заявки\n/booking <номер> — полная карточка заявки, например /booking 123";
const adminHelpText = `${helpText}\n/allow @username — дать сотруднику доступ`;
const usernamePattern = /^@?([a-zA-Z0-9_]{5,32})$/;
const bootstrapAdminUsernames = () => (process.env.TELEGRAM_BOOTSTRAP_ADMINS ?? "").split(",").map((username) => username.trim().replace(/^@/, "").toLowerCase()).filter(Boolean);
const bookingNumberFromCommand = (text: string) => text.match(/^\/booking\s+(\d+)$/)?.[1];
const findBookingByNumber = (bookings: Booking[], number: string) => bookings.find((booking) => booking.bookingNumber === Number(number));

export async function POST(request: NextRequest) {
  if (!matchesSecret(request.headers.get("x-telegram-bot-api-secret-token"), process.env.TELEGRAM_WEBHOOK_SECRET)) return NextResponse.json({ ok: false }, { status: 401 });
  let update: TelegramUpdate;
  try { update = await request.json() as TelegramUpdate; } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const callback = update.callback_query;
  const message = update.message;
  const userId = callback?.from?.id ?? message?.from?.id;
  const chatId = callback?.message?.chat?.id ?? message?.chat?.id;
  if (typeof userId !== "number" || (typeof chatId !== "number" && typeof chatId !== "string")) return NextResponse.json({ ok: true });
  const recipient = String(chatId);
  const store = await getStore();

  if (callback) {
    const operator = await store.getTelegramOperatorByUserId(String(userId));
    if (!operator) return NextResponse.json({ ok: false }, { status: 403 });
    const number = typeof callback.data === "string" ? callback.data.match(/^booking:(\d+)$/)?.[1] : undefined;
    if (!number) return NextResponse.json({ ok: true });
    await answerTelegramCallbackQuery(typeof callback.id === "string" ? callback.id : "");
    const booking = findBookingByNumber(await store.getBookings(), number);
    await sendTelegramMessage(recipient, booking ? formatBookingDetails(booking, "Заявка") : "Заявка не найдена.");
    return NextResponse.json({ ok: true });
  }

  if (typeof message?.text !== "string") return NextResponse.json({ ok: true });
  const normalized = message.text.trim();
  if (normalized === "/start") {
    const username = typeof message.from?.username === "string" ? message.from.username.match(usernamePattern)?.[1] : undefined;
    const operator = username ? await store.activateTelegramOperator({ telegramUserId: String(userId), username: username.toLowerCase(), bootstrapAdminUsernames: bootstrapAdminUsernames() }) : null;
    await sendTelegramMessage(recipient, operator ? `Доступ активирован. ${operator.role === "ADMIN" ? "Администратор." : "Сотрудник."}\n${operator.role === "ADMIN" ? adminHelpText : helpText}` : "Доступ не выдан. Попросите администратора добавить ваш @username через /allow.");
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
    const username = (allowMatch[1] ?? "").replace(/^@/, "").toLowerCase();
    await store.inviteTelegramOperator({ username });
    await sendTelegramMessage(recipient, `@${username} добавлен. Пусть пользователь напишет боту /start для активации доступа.`);
    return NextResponse.json({ ok: true });
  }
  if (normalized === "/new") {
    const bookings = (await store.getBookings()).filter((booking) => booking.status === "NEW").slice(0, 10);
    if (!bookings.length) { await sendTelegramMessage(recipient, "Новых заявок нет."); return NextResponse.json({ ok: true }); }
    await sendTelegramMessage(recipient, "Новые заявки:");
    for (const booking of bookings) await sendTelegramMessage(recipient, formatBookingSummary(booking), { replyMarkup: bookingDetailsReplyMarkup(booking) });
    return NextResponse.json({ ok: true });
  }
  const number = bookingNumberFromCommand(normalized);
  const booking = number ? findBookingByNumber(await store.getBookings(), number) : null;
  await sendTelegramMessage(recipient, number ? (booking ? formatBookingDetails(booking, "Заявка") : "Заявка не найдена.") : (operator.role === "ADMIN" ? adminHelpText : helpText));
  return NextResponse.json({ ok: true });
}
