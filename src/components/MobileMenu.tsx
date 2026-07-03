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
        className="text-on-surface-variant hover:text-gold transition-colors"
      >
        <span className="material-symbols-outlined">
          {open ? "close" : "menu"}
        </span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer dari kanan */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-surface z-50 shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header drawer */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-outline-variant">
          <span className="font-display text-lg font-bold tracking-tightest">MENU</span>
          <button
            onClick={() => setOpen(false)}
            className="text-on-surface-variant hover:text-gold"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-6 py-8 gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="label-sm py-4 border-b border-outline-variant/50 text-on-surface hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}