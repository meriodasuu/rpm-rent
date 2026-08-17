import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const store = vi.hoisted(() => ({
  createBooking: vi.fn(async () => ({ id: "booking-1" })),
}));

vi.mock("@/lib/data", () => ({ getStore: async () => store }));

const request = (body: string, ip: string, headers: Record<string, string> = {}) => new NextRequest("http://localhost/api/bookings", {
  method: "POST",
  headers: { "content-type": "application/json", "x-forwarded-for": ip, ...headers },
  body
});

describe("POST /api/bookings boundary", () => {
  it("accepts a booking request without birth or driving licence dates", async () => {
    const response = await POST(request(JSON.stringify({
      carId: "car-porsche-911", startAt: "2027-01-10", endAt: "2027-01-12", pickupMethod: "office", deliveryAddress: "",
      customerName: "Иван", phone: "+79991112233", telegram: "", additionalServiceIds: [], comment: "", privacyConsent: true,
      utm: {}, referrer: "", idempotencyKey: crypto.randomUUID()
    }), "192.0.2.4"));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, id: "booking-1" });
  });

  it("rejects malformed JSON without leaking an internal error", async () => {
    const response = await POST(request("{", "192.0.2.1"));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Некорректный формат данных" });
  });

  it("rejects an oversized request from the header before parsing", async () => {
    const response = await POST(request("{}", "192.0.2.2", { "content-length": "40000" }));
    expect(response.status).toBe(413);
  });

  it("rejects mass assignment at the public API boundary", async () => {
    const response = await POST(request(JSON.stringify({
      carId: "car-porsche-911", startAt: "2027-01-10", endAt: "2027-01-12", pickupMethod: "office", deliveryAddress: "",
      customerName: "Иван", phone: "+79991112233", telegram: "",
      additionalServiceIds: [], comment: "", privacyConsent: true, utm: {}, referrer: "", idempotencyKey: crypto.randomUUID(), status: "CONFIRMED"
    }), "192.0.2.3"));
    expect(response.status).toBe(422);
  });
});

