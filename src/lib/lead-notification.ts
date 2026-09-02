import type { Lead } from "@/types/domain";

const botApiUrl = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

export const notifyLeadCreated = async (lead: Lead): Promise<boolean> => {
  const chatId = process.env.TELEGRAM_ALERT_CHAT_ID?.trim();
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) return false;

  const text = [
    "🎯 Новый лид Яндекс.Директ",
    `Автомобиль: ${lead.carTitle}`,
    `Дата начала: ${lead.startAt}`,
    `Телефон: ${lead.phone}`,
    `Домен: ${lead.originDomain ?? "не определён"}`,
    `Посадочная: ${lead.landingPath}`,
    `Источник: ${lead.utm.yclid ? "yclid" : "utm_source=yandex"}`
  ].join("\n");

  try {
    const response = await fetch(botApiUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    });
    const result: unknown = await response.json();
    return response.ok && typeof result === "object" && result !== null && "ok" in result && result.ok === true;
  } catch {
    return false;
  }
};
