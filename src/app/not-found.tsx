import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { LiquidButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-32 text-center">
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-[140px]" />

        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            404
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Page not found.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>

          <div className="mt-10 flex justify-center">
            <LiquidButton asChild size="xl" className="rounded-full">
              <Link href="/">Back to home</Link>
            </LiquidButton>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
