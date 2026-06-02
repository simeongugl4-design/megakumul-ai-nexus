import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { useProfile } from "./use-profile";

const STORAGE_KEY = "mega-reduced-motion";

function getSystemPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return getSystemPrefersReducedMotion();
  });

  // Sync with profile when it loads
  useEffect(() => {
    if (profile && profile.reduced_motion !== undefined) {
      setReducedMotionState(profile.reduced_motion);
    }
  }, [profile]);

  // Apply class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }
  }, [reducedMotion]);

  // Listen for system preference changes when no explicit override is set
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return; // user has explicit override

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotionState(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setReducedMotion = useCallback(
    async (value: boolean) => {
      setReducedMotionState(value);
      localStorage.setItem(STORAGE_KEY, String(value));
      if (user) {
        await updateProfile({ reduced_motion: value } as any);
      }
    },
    [user, updateProfile]
  );

  return { reducedMotion, setReducedMotion };
}
