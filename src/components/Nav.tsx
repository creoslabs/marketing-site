import { LiquidButton } from "@/components/ui/button";

export default function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="#top" className="text-[15px] font-semibold tracking-tight">
          Creos Labs
        </a>

        <LiquidButton
          asChild
          variant="secondary"
          size="sm"
          className="rounded-full text-[13px]"
        >
          <a href="#waitlist">Get early access</a>
        </LiquidButton>
      </div>
    </header>
  );
}
