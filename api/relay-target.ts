export const telegramTarget = (path: string) => {
  if (!/^bot\d+:[A-Za-z0-9_-]+\/[A-Za-z][A-Za-z0-9]+$/.test(path)) {
    throw new Error("Invalid Telegram path");
  }
  return `https://api.telegram.org/${path}`;
};
