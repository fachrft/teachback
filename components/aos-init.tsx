"use client";

import { useEffect } from "react";
import AOS from "aos";
export function AOSInit() {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: "ease-out-cubic",
      offset: 50,
    });
  }, []);

  return null;
}
