const PRODUCTS = [
  {
    name: "Cardindex",
    tagline: "A connected-card system for notes and knowledge.",
    description:
      "Cardindex stores ideas, notes, and knowledge as linked cards. Built and maintained by our engineering team, and used internally before it shipped to anyone else.",
    tags: ["Productivity", "Knowledge base"],
    href: "#",
  },
  {
    name: "Creos",
    tagline: "The infrastructure behind Creos Labs.",
    description:
      "Creos is our core platform — the toolkit and infrastructure our own products run on, combining a clean interface with the systems underneath it.",
    tags: ["Platform", "Infrastructure"],
    href: "#",
  },
];

export default function Products() {
  return (
    <section id="products" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            What we&apos;ve built
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Two products. One engineering team.
          </p>
          <p className="mt-4 text-muted">
            Cardindex and Creos are built, deployed, and maintained by the
            same small team — no outsourcing, no separate vendors.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {PRODUCTS.map((product) => (
            <a
              key={product.name}
              href={product.href}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-surface p-8 transition hover:border-white/20 hover:bg-white/[0.06] sm:p-10"
            >
              <div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="mt-6 text-3xl font-semibold tracking-tight">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-accent-blue">
                  {product.tagline}
                </p>
                <p className="mt-4 leading-relaxed text-muted">
                  {product.description}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-1 text-[15px] font-medium text-accent-blue">
                Learn more
                <span className="transition group-hover:translate-x-0.5">›</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
