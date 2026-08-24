import { describe, expect, it } from "vitest";
import { telegramTarget } from "./relay-target";

describe("telegramTarget", () => {
  it("builds a Telegram Bot API URL from a bot method path", () => {
    expect(telegramTarget("bot123:abc/sendMessage")).toBe(
      "https://api.telegram.org/bot123:abc/sendMessage",
    );
  });

  it("rejects paths outside the Telegram Bot API", () => {
    expect(() => telegramTarget("https://example.com/steal")).toThrow("Invalid Telegram path");
  });
});
