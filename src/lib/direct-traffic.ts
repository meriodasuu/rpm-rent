export const isYandexDirectAttribution = (params: URLSearchParams) => {
  if (params.get("yclid")?.trim()) return true;
  return params.get("utm_source")?.trim().toLowerCase() === "yandex";
};
