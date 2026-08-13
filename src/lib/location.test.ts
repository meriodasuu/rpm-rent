import { describe, expect, it } from "vitest";
import { locationAdminSchema } from "./validation";

describe("locationAdminSchema", () => {
  it("accepts a publishable location with editorial content", () => {
    const result = locationAdminSchema.safeParse({
      id: "location-nevsky",
      slug: "nevsky-prospect",
      title: "Невский проспект",
      subtitle: "Городской маршрут",
      description: "Пространство для встреч, прогулок и маршрутов по центру Санкт-Петербурга.",
      image: "/images/locations/nevsky.jpg",
      published: true,
      sortOrder: 1,
      seoTitle: "Аренда авто на Невском",
      seoDescription: "Автомобили RPM Rent для поездок по Невскому проспекту."
    });

    expect(result.success).toBe(true);
  });

  it("allows an image-less draft but blocks publishing it", () => {
    const base = {
      id: "location-draft",
      slug: "location-draft",
      title: "Новая локация",
      subtitle: "Черновик маршрута",
      description: "Описание будущей локации, которое будет дополнено перед публикацией.",
      image: "",
      sortOrder: 99,
      seoTitle: null,
      seoDescription: null,
    };
    expect(locationAdminSchema.safeParse({ ...base, published: false }).success).toBe(true);
    expect(locationAdminSchema.safeParse({ ...base, published: true }).success).toBe(false);
  });
});
