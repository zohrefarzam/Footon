/**
 * Share to a Telegram group from wherever Lucky Fan runs:
 * 1. inside Telegram (Mini App): Telegram's own share link opener,
 * 2. a browser with the Web Share API (with the image when given and supported),
 * 3. otherwise download the image (if any) and open a t.me/share link.
 * Returns the method used, or null when the user cancelled.
 */
export type ShareMethod = "telegram" | "web_share" | "download" | "link";

type TelegramWebApp = { openTelegramLink?: (url: string) => void };

const telegramShareUrl = (text: string, url?: string) =>
  `https://t.me/share/url?url=${encodeURIComponent(url ?? (typeof location !== "undefined" ? location.origin : ""))}&text=${encodeURIComponent(text)}`;

export async function shareToTelegram({ text, url, file }: { text: string; url?: string; file?: File }): Promise<ShareMethod | null> {
  const tg = (globalThis as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(telegramShareUrl(text, url));
    return "telegram";
  }

  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  if (nav?.share) {
    const data: ShareData = { text, url };
    if (file && nav.canShare?.({ files: [file] })) data.files = [file];
    try {
      await nav.share(data);
      return "web_share";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return null;
      // fall through to the link
    }
  }

  if (file) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = file.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  window.open(telegramShareUrl(text, url), "_blank", "noopener");
  return file ? "download" : "link";
}
