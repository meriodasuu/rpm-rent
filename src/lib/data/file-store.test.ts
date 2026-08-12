import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSeedDatabase } from "@/data/seed";
import { bookingSchema, type BookingInput } from "@/lib/validation";
import type { DevDatabase } from "@/types/domain";
import { FileStore } from "./file-store";

const buildSeed = (): DevDatabase => {
  const database = createSeedDatabase();
  database.cars = database.cars.map((car, index) => index === 0 ? { ...car, available: true, published: true, minimumAge: 18, minimumDrivingExperience: 12, minimumRentalDays: 2 } : car);
  return database;
};

const bookingInput = (overrides: Partial<BookingInput> = {}) => bookingSchema.parse({
  carId: buildSeed().cars[0]!.id,
  startAt: "2027-01-10",
  endAt: "2027-01-12",
  pickupMethod: "office",
  deliveryAddress: "",
  customerName: "Иван",
  phone: "+7 999 111-22-33",
  telegram: "@ivan_77",
  birthDate: "1990-01-01",
  licenseIssuedOn: "2020-01-10",
  additionalServiceIds: [],
  comment: "",
  privacyConsent: true,
  utm: {},
  referrer: "",
  idempotencyKey: crypto.randomUUID(),
  ...overrides
});

describe("FileStore booking integrity", () => {
  let directory = "";
  let store: FileStore;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "rpm-rent-test-"));
    store = new FileStore(path.join(directory, "db.json"), buildSeed);
  });

  afterEach(async () => {
    if (directory) await fs.rm(directory, { recursive: true, force: true });
  });

  it("serializes concurrent overlapping requests so exactly one wins", async () => {
    const results = await Promise.allSettled([
      store.createBooking(bookingInput()),
      store.createBooking(bookingInput())
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected && rejected.status === "rejected" ? rejected.reason.message : "").toContain("уже занят");
  });

  it("returns the original booking for an idempotent retry", async () => {
    const input = bookingInput();
    const first = await store.createBooking(input);
    const second = await store.createBooking(input);
    expect(second.id).toBe(first.id);
    expect((await store.getBookings())).toHaveLength(1);
  });

  it("releases dates after cancellation but not while the request is active", async () => {
    const first = await store.createBooking(bookingInput());
    await expect(store.createBooking(bookingInput())).rejects.toThrow("уже занят");
    await store.updateBookingStatus(first.id, "CANCELLED");
    await expect(store.createBooking(bookingInput())).resolves.toMatchObject({ status: "NEW" });
  });

  it("enforces lifecycle transitions in the persistence layer", async () => {
    const booking = await store.createBooking(bookingInput());
    await store.updateBookingStatus(booking.id, "CONFIRMED");
    await store.updateBookingStatus(booking.id, "COMPLETED");
    await expect(store.updateBookingStatus(booking.id, "NEW")).rejects.toThrow("запрещён");
  });

  it("preserves historical car, service, price and policy snapshots", async () => {
    const database = buildSeed();
    const service = database.services.find((item) => item.published)!;
    store = new FileStore(path.join(directory, "snapshots.json"), () => database);
    const created = await store.createBooking(bookingInput({ additionalServiceIds: [service.id] }));
    const car = (await store.getCarById(created.carId))!;
    await store.saveCar({ ...car, title: "Renamed", pricePerDay: car.pricePerDay + 10_000, minimumAge: 25 });
    const saved = (await store.getBookings())[0]!;
    expect(saved.carTitle).toBe(created.carTitle);
    expect(saved.pricePerDaySnapshot).toBe(created.pricePerDaySnapshot);
    expect(saved.minimumAgeApplied).toBe(18);
    expect(saved.additionalServicesSnapshot[0]).toMatchObject({ id: service.id, title: service.title, price: service.price ?? 0 });
    await expect(store.deleteService(service.id)).rejects.toThrow("использованную в заявках");
  });

  it("rejects unavailable cars, unknown services and duplicate slugs", async () => {
    const car = (await store.getCars({ includeHidden: true }))[0]!;
    await store.saveCar({ ...car, available: false });
    await expect(store.createBooking(bookingInput())).rejects.toThrow("недоступен");
    await store.saveCar({ ...car, available: true });
    await expect(store.createBooking(bookingInput({ additionalServiceIds: ["missing-service"] }))).rejects.toThrow("услуг");
    const another = (await store.getCars({ includeHidden: true }))[1]!;
    await expect(store.saveCar({ ...another, slug: car.slug })).rejects.toThrow("slug");
  });

  it("protects booking history from car deletion", async () => {
    const booking = await store.createBooking(bookingInput());
    await expect(store.deleteCar(booking.carId)).rejects.toThrow("с заявками");
  });
});
