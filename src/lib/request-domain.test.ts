import { describe, expect, it } from "vitest";
import { getRequestOriginDomain } from "./request-domain";

describe("getRequestOriginDomain", () => {
  it.each([
    ["https://rpm-rent.ru/api/bookings", "rpm-rent.ru"],
    ["https://rpmrent.ru/api/leads", "rpmrent.ru"],
    ["http://localhost/api/bookings", null]
  ])("maps %s to %s", (url, expected) => {
    expect(getRequestOriginDomain(new Request(url))).toBe(expected);
  });
});
