export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-[13px] text-muted sm:flex-row">
        <div className="font-medium text-foreground">Creos Labs</div>
        <a href="mailto:hello@creos-labs.com" className="transition hover:text-foreground">
          hello@creos-labs.com
        </a>
        <p>© {new Date().getFullYear()} Creos Labs. All rights reserved.</p>
      </div>
    </footer>
  );
}
