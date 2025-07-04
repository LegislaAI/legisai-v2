"use client";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({
      showSpinner: true, // Hide the spinner
      speed: 500, // Animation speed
      minimum: 0.3, // Minimum percentage
    });
  }, []);

  useEffect(() => {
    // Complete progress when route changes
    NProgress.done();
  }, [pathname, searchParams]);

  // Listen for navigation start
  useEffect(() => {
    const handleStart = () => NProgress.start();

    // Intercept router methods
    const originalPush = window.history.pushState;
    window.history.pushState = function (...args) {
      handleStart();
      return originalPush.apply(this, args);
    };

    return () => {
      window.history.pushState = originalPush;
    };
  }, []);

  return null;
}
