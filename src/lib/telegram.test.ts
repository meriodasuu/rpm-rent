import { describe, expect, it } from "vitest";

import { telegramBotApiUrl } from "@/lib/telegram";

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
