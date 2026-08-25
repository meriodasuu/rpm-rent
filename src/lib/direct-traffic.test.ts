import { describe, expect, it } from "vitest";
import { isYandexDirectAttribution } from "./direct-traffic";

describe("isYandexDirectAttribution", () => {
  it("recognizes a Yandex Direct click id", () => {
    expect(isYandexDirectAttribution(new URLSearchParams("yclid=123456"))).toBe(true);
  });

  it("recognizes a Yandex UTM source regardless of letter case", () => {
    expect(isYandexDirectAttribution(new URLSearchParams("utm_source=Yandex"))).toBe(true);
  });

  it("does not classify unrelated UTM traffic as Direct", () => {
    expect(isYandexDirectAttribution(new URLSearchParams("utm_source=google&utm_medium=cpc"))).toBe(false);
  });
});
