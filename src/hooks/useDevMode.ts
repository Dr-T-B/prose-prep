import { useEffect, useState } from "react";

const STORAGE_KEY = "devMode";

/**
 * Dev mode toggle for prose-prep.
 *
 * Activation:   visit any URL with ?mode=dev appended
 * Deactivation: visit any URL with ?mode=student appended
 * Persists in localStorage across sessions.
 * No UI surface — invisible to student.
 *
 * Default: student mode (returns false).
 */
export function useDevMode(): boolean {
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");

    if (mode === "dev") {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsDevMode(true);
    } else if (mode === "student") {
      localStorage.removeItem(STORAGE_KEY);
      setIsDevMode(false);
    }
  }, []);

  return isDevMode;
}
