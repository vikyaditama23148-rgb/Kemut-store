"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Shrink navbar on scroll
    const nav = document.querySelector("nav");
    const handleScroll = () => {
      if (!nav) return;
      if (window.scrollY > 60) {
        nav.classList.add("py-4");
        nav.classList.remove("py-6");
      } else {
        nav.classList.add("py-6");
        nav.classList.remove("py-4");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}