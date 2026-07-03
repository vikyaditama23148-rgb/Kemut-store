"use client";

import { useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string; show: boolean };

export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        style={{ color: "#1b1c1c" }}
      >
        <span className="material-symbols-outlined">
          {open ? "close" : "menu"}
        </span>
      </button>

      {/* Overlay gelap */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#111111" }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
        >
          <span
            className="font-display text-lg font-bold tracking-tightest"
            style={{ color: "#ffffff" }}
          >
            KEMUT.STORE
          </span>
          <button
            onClick={() => setOpen(false)}
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-6 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="label-sm py-5 transition-colors"
              style={{
                color: "#ffffff",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "block",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#d4af37")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff")}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}