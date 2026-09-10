"use client";

import { useState } from "react";
import { LiquidButton } from "@/components/ui/button";

const LINKS = [
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="#top" className="text-[15px] font-semibold tracking-tight">
          Creos Labs
        </a>

        <nav className="hidden items-center gap-10 text-[13px] text-muted md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <LiquidButton
          asChild
          variant="secondary"
          size="sm"
          className="hidden rounded-full text-[13px] md:inline-flex"
        >
          <a href="#contact">Get in touch</a>
        </LiquidButton>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 md:hidden"
          aria-label="Toggle menu"
        >
          <span className="text-base leading-none">{open ? "×" : "≡"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4 text-sm text-muted">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="transition hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <LiquidButton
              asChild
              variant="secondary"
              size="sm"
              className="w-full rounded-full"
            >
              <a href="#contact" onClick={() => setOpen(false)}>
                Get in touch
              </a>
            </LiquidButton>
          </nav>
        </div>
      )}
    </header>
  );
}
