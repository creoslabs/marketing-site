"use client";

import { useState } from "react";
import { Home, Briefcase, Info, Mail } from "lucide-react";
import { LiquidButton } from "@/components/ui/button";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

const LINKS = [
  { label: "Work", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const DOCK_ITEMS = [
  { label: "Home", href: "#top", icon: Home },
  { label: "Work", href: "#products", icon: Briefcase },
  { label: "About", href: "#about", icon: Info },
  { label: "Contact", href: "#contact", icon: Mail },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl md:border-b-0 md:bg-transparent md:backdrop-blur-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <a href="#top" className="text-[15px] font-semibold tracking-tight">
            Creos Labs
          </a>

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

      <div className="fixed inset-x-0 bottom-6 z-50 hidden justify-center md:flex">
        <Dock className="border border-white/10 bg-black/70 backdrop-blur-xl">
          {DOCK_ITEMS.map((item) => (
            <DockItem
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className="aspect-square rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <DockLabel>{item.label}</DockLabel>
              <DockIcon>
                <item.icon className="h-full w-full text-foreground" />
              </DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>
    </>
  );
}
