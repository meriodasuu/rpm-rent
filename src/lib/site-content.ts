export type SocialKind = "telegram" | "instagram" | "generic";

export const normalizeSocialUrl = (kind: SocialKind, value: string): string => {
  if (/^https:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "").replace(/^\/+/, "");
  if (kind === "telegram") return `https://t.me/${handle}`;
  if (kind === "instagram") return `https://www.instagram.com/${handle}`;
  return `https://${handle}`;
};

export const CONTACTS = {
  phone: "+7 993 983-80-80",
  phoneHref: "tel:+79939838080",
  max: { phone: "+7 993 983-80-80", href: "tel:+79939838080" },
  address: "Санкт-Петербург, проспект Маршала Блюхера, 12к7",
  website: "https://rpmrent.ru",
  mapHref: "https://yandex.ru/maps/?text=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3%2C%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%20%D0%9C%D0%B0%D1%80%D1%88%D0%B0%D0%BB%D0%B0%20%D0%91%D0%BB%D1%8E%D1%85%D0%B5%D1%80%D0%B0%2C%2012%D0%BA7",
  mapEmbed: "https://yandex.ru/map-widget/v1/?mode=search&text=%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3%2C%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%20%D0%9C%D0%B0%D1%80%D1%88%D0%B0%D0%BB%D0%B0%20%D0%91%D0%BB%D1%8E%D1%85%D0%B5%D1%80%D0%B0%2C%2012%D0%BA7&z=16",
  socials: [
    { label: "ВКонтакте", href: normalizeSocialUrl("generic", "https://vk.ru/rpm_rent") },
    { label: "Instagram", href: normalizeSocialUrl("instagram", "rpm_rent") },
    { label: "TikTok", href: normalizeSocialUrl("generic", "https://www.tiktok.com/@rpmrent") },
    { label: "YouTube", href: normalizeSocialUrl("generic", "https://youtube.com/@rpm_rent_yt") },
    { label: "Telegram", href: normalizeSocialUrl("telegram", "rpmrent") },
    { label: "Авито", href: normalizeSocialUrl("generic", "https://m.avito.ru/brands/rpmrent") },
    { label: "Сайт", href: normalizeSocialUrl("generic", "https://rpmrent.ru") }
  ]
} as const;

export const LOCATIONS = [
  { title: "Центр Петербурга", subtitle: "Личный маршрут", image: "/images/atmosphere/saint-petersburg-blue-hour.png", href: "/cars?category=Спорт" },
  { title: "Петроградская сторона", subtitle: "Город и пространство", image: "/images/cars/li-auto-l6/01.jpg", href: "/cars?category=SUV" },
  { title: "Дворцовая набережная", subtitle: "Особый повод", image: "/images/cars/bentley-continental/02.jpg", href: "/cars?category=Гран-туризмо" },
  { title: "Курортный маршрут", subtitle: "Долгая поездка", image: "/images/cars/lamborghini-urus/05.jpg", href: "/cars?category=SUV" }
] as const;

export const ROUTE_CATEGORIES = [
  { label: "Для города", href: "/cars?category=Спорт", icon: "city" },
  { label: "Для деловой поездки", href: "/cars?category=SUV", icon: "business" },
  { label: "Для события", href: "/cars?category=Гран-туризмо", icon: "event" },
  { label: "На длительный срок", href: "/cars?category=SUV", icon: "long" }
] as const;
