"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "rpm-font-preview";
const FONT_EVENT = "rpm-font-preview-change";

export type FontPreference = "manrope" | "conthrax" | "inter";

type RootElement = { dataset: { font?: string } };
type FontStorage = { setItem(key: string, value: string): void };

const options: Array<{ value: FontPreference; label: string }> = [
  { value: "manrope", label: "Manrope" },
  { value: "conthrax", label: "Conthrax" },
  { value: "inter", label: "Inter" },
];

export function readFontPreference(value: string | null): FontPreference {
  return value === "conthrax" || value === "inter" || value === "manrope" ? value : "manrope";
}

export function applyFontPreference(
  preference: FontPreference,
  root: RootElement = document.documentElement,
  storage: FontStorage = localStorage,
) {
  root.dataset.font = preference;
  storage.setItem(STORAGE_KEY, preference);
}

const subscribe = (callback: () => void) => {
  window.addEventListener(FONT_EVENT, callback);
  return () => window.removeEventListener(FONT_EVENT, callback);
};

const getFontSnapshot = (): FontPreference => readFontPreference(document.documentElement.dataset.font ?? null);

function FontButtons({ preference, onChange }: { preference: FontPreference; onChange: (value: FontPreference) => void }) {
  return <>{options.map(({ value, label }) => <button aria-pressed={preference === value} className="font-preview-button" key={value} onClick={() => onChange(value)} type="button">{label}</button>)}</>;
}

export function FontPreviewToggle() {
  const preference = useSyncExternalStore<FontPreference>(subscribe, getFontSnapshot, () => "manrope");
  const selectFont = (value: FontPreference) => {
    applyFontPreference(value);
    window.dispatchEvent(new Event(FONT_EVENT));
  };

  return (
    <div className="font-preview-toggle">
      <div className="font-preview-options" role="group" aria-label="Предпросмотр шрифта">
        <FontButtons preference={preference} onChange={selectFont} />
      </div>
      <details className="font-preview-menu">
        <summary>Шрифт</summary>
        <div className="font-preview-menu-options" role="group" aria-label="Предпросмотр шрифта">
          <FontButtons preference={preference} onChange={selectFont} />
        </div>
      </details>
    </div>
  );
}
