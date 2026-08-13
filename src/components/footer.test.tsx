import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";

describe("Footer", () => {
  it("keeps a text-only footer statement while using the shared image logo", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("rpm-logo-light.png");
    expect(html).toContain("rpm-logo-dark.png");
    expect(html).not.toContain("rpm-footer-cutout");
  });
});
