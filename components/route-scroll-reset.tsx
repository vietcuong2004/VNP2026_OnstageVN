"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function RouteScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.body.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.querySelectorAll("[data-app-scroll-root], main").forEach((element) => {
        element.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    };

    reset();
    const firstFrame = window.requestAnimationFrame(reset);
    const secondFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(reset);
    });
    const timer = window.setTimeout(reset, 80);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timer);
    };
  }, [pathname, search]);

  return null;
}
