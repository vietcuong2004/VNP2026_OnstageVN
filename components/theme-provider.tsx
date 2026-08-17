"use client";

import * as React from "react";

export const THEME_STORAGE_KEY = "onstagevn_theme";
export const THEME_UPDATED_EVENT = "onstagevn:theme-updated";
export type AppTheme = "dark" | "light";

export function applyAppTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.style.colorScheme = theme;
}

function getDefaultAppTheme(): AppTheme {
  return "light";
}

function normalizeStoredTheme(value: string | null): AppTheme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function getStoredAppTheme(): AppTheme {
  if (typeof window === "undefined") return getDefaultAppTheme();

  const storedTheme = normalizeStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  if (storedTheme) return storedTheme;

  return getDefaultAppTheme();
}

export function setStoredAppTheme(theme: AppTheme) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyAppTheme(theme);
  window.dispatchEvent(new CustomEvent(THEME_UPDATED_EVENT, { detail: { theme } }));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    applyAppTheme(getStoredAppTheme());
  }, []);

  return <>{children}</>;
}
