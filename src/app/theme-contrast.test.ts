import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

describe("theme contrast", () => {
  it("keeps icon glyphs opposite to an ink-colored icon background", () => {
    expect(stylesheet).toMatch(/\.service-card \.icon-box, \.icon-box \{[^}]*background: var\(--ink\); color: var\(--button-primary-ink\);/s);
  });
});
