"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { ThemeMode } from "@/lib/theme";

const STORAGE_KEY = "rpm-theme-mode";
const THEME_EVENT = "rpm-theme-mode-change";

const modes = [
  { value: "system", label: "Как на устройстве", icon: Monitor },
  { value: "light", label: "Светлая тема", icon: Sun },
  { value: "dark", label: "Тёмная тема", icon: Moon }
] as const satisfies ReadonlyArray<{ value: ThemeMode; label: string; icon: typeof Monitor }>;

const applyThemeMode = (mode: ThemeMode) => {
  document.documentElement.dataset.themeMode = mode;
  if (mode === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = mode;
};

const subscribe = (callback: () => void) => {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
};

const getThemeModeSnapshot = (): ThemeMode => {
  const mode = document.documentElement.dataset.themeMode;
  return mode === "light" || mode === "dark" ? mode : "system";
};

const getServerThemeModeSnapshot = (): ThemeMode => "system";

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getThemeModeSnapshot, getServerThemeModeSnapshot);

  const chooseMode = (nextMode: ThemeMode) => {
    applyThemeMode(nextMode);
    if (nextMode === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Цветовая тема">
      {modes.map(({ value, label, icon: Icon }) => (
        <button
          aria-label={label}
          aria-pressed={mode === value}
          className="theme-toggle-button"
          key={value}
          onClick={() => chooseMode(value)}
          title={label}
          type="button"
        >
          <Icon aria-hidden size={15} />
        </button>
      ))}
    </div>
  );
}
