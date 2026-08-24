const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token || !secret) {
  throw new Error("Telegram bot credentials are required");
}

const telegramUrl = `https://api.telegram.org/bot${token}/getUpdates`;
const webhookUrl = "http://app:3000/api/telegram/webhook";
let offset = 0;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

while (true) {
  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ offset, timeout: 50, allowed_updates: ["message", "callback_query"] })
    });
    const payload = await response.json();
    if (!response.ok || payload.ok !== true) throw new Error(payload.description ?? `Telegram HTTP ${response.status}`);

    for (const update of payload.result) {
      const forwarded = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-telegram-bot-api-secret-token": secret
        },
        body: JSON.stringify(update)
      });
      if (forwarded.status >= 500) throw new Error(`Webhook HTTP ${forwarded.status}`);
      offset = update.update_id + 1;
    }
  } catch (error) {
    console.error(new Date().toISOString(), error instanceof Error ? error.message : error);
    await wait(2000);
  }
}
