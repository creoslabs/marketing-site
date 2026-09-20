"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LiquidButton } from "@/components/ui/button";

const PRODUCTS = [
  { name: "Outlier", tagline: "Find what's outperforming.", href: "/products/outlier" },
  { name: "Signal", tagline: "Analyse creative before launch.", href: "/products/signal" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 z-50 w-full border-b transition-colors duration-300 ${
        scrolled || mobileOpen ? "border-white/10 bg-black/70 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/#top" className="text-[15px] font-semibold tracking-tight">
            Creos Labs
          </Link>

          <nav className="hidden items-center gap-6 text-[13.5px] text-muted sm:flex">
            <div ref={ref} className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 transition hover:text-foreground"
              >
                Products
                <span className="text-[10px]">▾</span>
              </button>
              {open && (
                <div className="absolute left-0 top-[calc(100%+14px)] w-64 rounded-xl border border-white/10 bg-[#0a0a0c] p-2 shadow-2xl">
                  {PRODUCTS.map((p) => (
                    <Link
                      key={p.name}
                      href={p.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 transition hover:bg-white/5"
                    >
                      <span className="block text-[13.5px] font-medium text-foreground">{p.name}</span>
                      <span className="mt-0.5 block text-[12px] text-muted">{p.tagline}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/#pricing" className="link-underline transition hover:text-foreground">
              Pricing
            </Link>
            <Link href="/about" className="link-underline transition hover:text-foreground">
              About
            </Link>
            <Link href="/insights" className="link-underline transition hover:text-foreground">
              Insights
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="link-underline hidden text-[13.5px] text-muted transition hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <LiquidButton asChild variant="secondary" size="sm" className="rounded-full text-[13px]">
            <Link href="/#pricing">Get Creos</Link>
          </LiquidButton>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 shrink-0 flex-col items-center justify-center gap-[5px] sm:hidden"
          >
            <span className={`h-px w-4 bg-foreground transition-transform ${mobileOpen ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-px w-4 bg-foreground transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`h-px w-4 bg-foreground transition-transform ${mobileOpen ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-0.5 border-t border-white/10 px-6 py-3 text-[14px] sm:hidden">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Products</p>
          {PRODUCTS.map((p) => (
            <Link
              key={p.name}
              href={p.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-foreground transition hover:bg-white/5"
            >
              {p.name}
            </Link>
          ))}
          <div className="my-2 h-px bg-white/10" />
          <Link href="/#pricing" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-foreground transition hover:bg-white/5">
            Pricing
          </Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-foreground transition hover:bg-white/5">
            About
          </Link>
          <Link href="/insights" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-foreground transition hover:bg-white/5">
            Insights
          </Link>
          <div className="my-2 h-px bg-white/10" />
          <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-foreground transition hover:bg-white/5">
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
