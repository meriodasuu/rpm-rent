import type { Booking } from "@/types/domain";

type TelegramReplyMarkup = { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> };
type TelegramMessageOptions = { replyMarkup?: TelegramReplyMarkup };

export const telegramBotApiUrl = (token: string, method: string, relayUrl?: string) => {
  const path = `bot${token}/${method}`;
  return relayUrl?.trim()
    ? `${relayUrl.trim()}?path=${encodeURIComponent(path)}`
    : `https://api.telegram.org/${path}`;
};

const botApiUrl = (method: string) => telegramBotApiUrl(
  process.env.TELEGRAM_BOT_TOKEN ?? "",
  method,
  process.env.TELEGRAM_API_RELAY_URL
);
const money = (amount: number) => new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
const pickupMethod = (booking: Booking) => booking.pickupMethod === "delivery" ? "Доставка" : "Офис";

export const formatBookingDetails = (booking: Booking, heading = "Новая заявка") => {
  const services = booking.additionalServicesSnapshot.length
    ? booking.additionalServicesSnapshot.map((service) => `${service.title} (${money(service.price)})`).join(", ")
    : "Нет";
  return [
    `🆕 ${heading}`,
    `Заявка #${booking.bookingNumber}`,
    `Автомобиль: ${booking.carTitle}`,
    `Даты: ${booking.startAt} — ${booking.endAt} (${booking.rentalDays} дн.)`,
    `Получение: ${pickupMethod(booking)}${booking.deliveryAddress ? `, ${booking.deliveryAddress}` : ""}`,
    `Клиент: ${booking.customerName}`,
    `Телефон: ${booking.phone}`,
    `Telegram: ${booking.telegram ?? "не указан"}`,
    `Услуги: ${services}`,
    `Стоимость: ${money(booking.rentalPrice + booking.additionalServicesPrice)}, залог ${money(booking.deposit)}`,
    `Комментарий: ${booking.comment ?? "нет"}`,
    `Статус: ${booking.status}`,
    `Команда: /booking ${booking.bookingNumber}`
  ].join("\n");
};

export const formatBookingSummary = (booking: Booking) => [
  `Заявка #${booking.bookingNumber}`,
  `Телефон: ${booking.phone}`,
  `Telegram: ${booking.telegram ?? "не указан"}`,
  `Автомобиль: ${booking.carTitle}`,
  `Аренда: ${booking.startAt} — ${booking.endAt} · ${booking.rentalDays} дн.`
].join("\n");

export const bookingDetailsReplyMarkup = (booking: Booking): TelegramReplyMarkup => ({
  inline_keyboard: [[{ text: "Подробнее", callback_data: `booking:${booking.bookingNumber}` }]]
});

export const sendTelegramMessage = async (chatId: string, text: string, options: TelegramMessageOptions = {}): Promise<boolean> => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) return false;
  try {
    const response = await fetch(botApiUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true, ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}) })
    });
    const result: unknown = await response.json();
    return response.ok && typeof result === "object" && result !== null && "ok" in result && result.ok === true;
  } catch { return false; }
};

export const answerTelegramCallbackQuery = async (callbackQueryId: string): Promise<boolean> => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !callbackQueryId) return false;
  try {
    const response = await fetch(botApiUrl("answerCallbackQuery"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_query_id: callbackQueryId }) });
    const result: unknown = await response.json();
    return response.ok && typeof result === "object" && result !== null && "ok" in result && result.ok === true;
  } catch { return false; }
};

export const notifyBookingCreated = async (booking: Booking) => {
  const chatId = process.env.TELEGRAM_ALERT_CHAT_ID?.trim();
  return chatId ? sendTelegramMessage(chatId, formatBookingDetails(booking)) : false;
};
