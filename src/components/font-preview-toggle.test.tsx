import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyFontPreference,
  FontPreviewToggle,
  readFontPreference,
} from "./font-preview-toggle";

describe("font preview preferences", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses Manrope when no saved preference exists", () => {
    expect(readFontPreference(null)).toBe("manrope");
  });

  it("rejects an unrecognized saved preference", () => {
    expect(readFontPreference("comic-sans")).toBe("manrope");
  });

  it("applies and persists an explicit font selection", () => {
    const root = { dataset: {} as DOMStringMap };
    const saved: Record<string, string> = {};
    const storage = { setItem: (key: string, value: string) => { saved[key] = value; } };

    applyFontPreference("inter", root, storage);

    expect(root.dataset.font).toBe("inter");
    expect(saved["rpm-font-preview"]).toBe("inter");
  });

  it("applies the default choice to the document root", () => {
    const root = { dataset: {} as DOMStringMap };
    const storage = { setItem: () => undefined };

    applyFontPreference("manrope", root, storage);

    expect(root.dataset.font).toBe("manrope");
  });

  it("applies and notifies subscribers when persistence is unavailable", () => {
    const root = { dataset: {} as DOMStringMap };
    const storage = { setItem: () => { throw new Error("storage unavailable"); } };
    const eventTarget = new EventTarget();
    let notified = false;
    eventTarget.addEventListener("rpm-font-preview-change", () => { notified = true; });
    vi.stubGlobal("window", eventTarget);

    expect(() => applyFontPreference("conthrax", root, storage)).not.toThrow();

    expect(root.dataset.font).toBe("conthrax");
    expect(notified).toBe(true);
  });

  it("renders labelled desktop choices and a compact mobile trigger", () => {
    const html = renderToStaticMarkup(<FontPreviewToggle />);

    expect(html).toContain('aria-label="Предпросмотр шрифта"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain(">Наш шрифт</button>");
    expect(html).toContain(">Conthrax</button>");
    expect(html).toContain(">Inter</button>");
    expect(html).toContain("<summary>Шрифт</summary>");
  });
});
import { renderToStaticMarkup } from "react-dom/server";
