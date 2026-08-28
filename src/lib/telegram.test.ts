import { afterEach, describe, expect, it, vi } from "vitest";

import { editTelegramMessage, telegramBotApiUrl } from "@/lib/telegram";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TELEGRAM_BOT_TOKEN;
});

describe("telegramBotApiUrl", () => {
  it("uses Telegram directly by default", () => {
    expect(telegramBotApiUrl("123:abc", "getMe")).toBe("https://api.telegram.org/bot123:abc/getMe");
  });

  it("routes requests through the configured relay", () => {
    expect(telegramBotApiUrl("123:abc", "sendMessage", "https://relay.example/api/telegram")).toBe(
      "https://relay.example/api/telegram?path=bot123%3Aabc%2FsendMessage"
    );
  });
});

describe("editTelegramMessage", () => {
  it("edits the existing Telegram message with inline controls", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:abc";
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(editTelegramMessage("-100456", 77, "Updated", {
      replyMarkup: { inline_keyboard: [[{ text: "Back", callback_data: "bookings:ALL:all:0" }]] }
    })).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith("https://api.telegram.org/bot123:abc/editMessageText", expect.objectContaining({
      body: JSON.stringify({
        chat_id: "-100456", message_id: 77, text: "Updated", disable_web_page_preview: true,
        reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "bookings:ALL:all:0" }]] }
      })
    }));
  });
});
