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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
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
            <Link href="/#pricing" className="transition hover:text-foreground">
              Pricing
            </Link>
            <Link href="/about" className="transition hover:text-foreground">
              About
            </Link>
            <Link href="/insights" className="transition hover:text-foreground">
              Insights
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-[13.5px] text-muted transition hover:text-foreground sm:block">
            Sign in
          </Link>
          <LiquidButton asChild variant="secondary" size="sm" className="rounded-full text-[13px]">
            <Link href="/#pricing">Get Creos</Link>
          </LiquidButton>
        </div>
      </div>
    </header>
  );
}
