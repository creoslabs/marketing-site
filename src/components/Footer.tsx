import Link from "next/link";
import { BrandLockup } from "@/components/brand";

// Static by default (plain "/login") so most marketing pages keep
// prerendering. /products/outlier and /products/signal also render at the
// outlier./signal.<host> subdomain root, where /login only exists on the
// root app tree — those callers pass the resolved cross-subdomain href
// instead of forcing every Footer caller to become dynamic just to read it.
export default function Footer({ loginHref = "/login" }: { loginHref?: string }) {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-[13px] text-muted sm:flex-row">
        <BrandLockup height={18} />
        <a href="mailto:hello@creos-labs.com" className="link-underline transition hover:text-foreground">
          hello@creos-labs.com
        </a>
        <p>© {new Date().getFullYear()} Creos Labs. All rights reserved.</p>
        <Link href={loginHref} className="link-underline transition hover:text-foreground">
          Log in
        </Link>
      </div>
    </footer>
  );
}
