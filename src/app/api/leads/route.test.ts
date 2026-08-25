import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const store = vi.hoisted(() => ({ createLead: vi.fn(async () => ({ lead: { id: "lead-1" }, created: true })) }));
vi.mock("@/lib/data", () => ({ getStore: async () => store }));
vi.mock("@/lib/lead-notification", () => ({ notifyLeadCreated: vi.fn(async () => false) }));

const payload = {
  carId: "tesla-model-3", startAt: "2026-09-01", phone: "+7 999 123-45-67", privacyConsent: true,
  utm: { utm_source: "yandex", yclid: "123" }, landingPath: "/cars/tesla-model-3", referrer: "",
  idempotencyKey: "6dba29c0-6d76-4c44-94e8-4b3ebcbb6eb3"
};

describe("POST /api/leads", () => {
  it("persists a minimal Direct lead without invoking booking creation", async () => {
    const response = await POST(new NextRequest("http://localhost/api/leads", { method: "POST", body: JSON.stringify(payload) }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, id: "lead-1" });
    expect(store.createLead).toHaveBeenCalledWith(payload);
  });

  it("rejects a request without a phone number", async () => {
    const response = await POST(new NextRequest("http://localhost/api/leads", { method: "POST", body: JSON.stringify({ ...payload, phone: "" }) }));
    expect(response.status).toBe(422);
  });
});
