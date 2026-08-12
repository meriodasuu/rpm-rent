import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";

describe("Footer", () => {
  it("renders the classic logo and a text-only statement", () => {
    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("<span>RPM</span><small>RENT</small>");
    expect(html).toContain("Ваш маршрут<br/>начинается здесь.");
    expect(html).not.toContain("rpm-footer-cutout");
    expect(html).toContain("MAX · +7 993 983-80-80");
  });
});
