import { describe, expect, it } from "vitest";
import { closeNavigationMenu, isNavigationActive } from "./navigation";

describe("isNavigationActive", () => {
  it("matches exact and nested routes", () => {
    expect(isNavigationActive("/cars", "/cars")).toBe(true);
    expect(isNavigationActive("/cars/porsche-911", "/cars")).toBe(true);
  });

  it("does not match a sibling route with the same prefix", () => {
    expect(isNavigationActive("/cars-archive", "/cars")).toBe(false);
    expect(isNavigationActive("/contacts", "/cars")).toBe(false);
  });

  it("matches the home route only exactly", () => {
    expect(isNavigationActive("/", "/")).toBe(true);
    expect(isNavigationActive("/cars", "/")).toBe(false);
  });
});

describe("closeNavigationMenu", () => {
  it("closes an open details menu after a mobile navigation choice", () => {
    const menu = { open: true };

    closeNavigationMenu(menu);

    expect(menu.open).toBe(false);
  });

  it("does nothing when the link is outside a details menu", () => {
    expect(() => closeNavigationMenu(null)).not.toThrow();
  });
});
