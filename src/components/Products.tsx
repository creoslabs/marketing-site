import { Reveal } from "@/components/Reveal";

const PRODUCTS = [
  {
    name: "Cardindex",
    tagline: "A connected-card system for content ideas and inspiration.",
    description:
      "Cardindex helps creators and marketers capture ideas, inspiration, and campaign notes as linked cards — engineered end to end, from idea to production.",
    tags: ["Content ideas", "Creator tools"],
    href: "#",
  },
  {
    name: "Creos",
    tagline: "A content lab, custom-built for creators and marketers.",
    description:
      "Creos is a content lab — a platform for planning, producing, and managing content, designed and engineered the same way we build for our clients.",
    tags: ["Content lab", "Marketing"],
    href: "#",
  },
];

export default function Products() {
  return (
    <section id="products" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
            Selected work
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Two solutions. One team.
          </p>
          <p className="mt-4 text-muted">
            Creos and Cardindex are examples of the marketing technology we
            build — engineered in-house, end to end.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {PRODUCTS.map((product, i) => (
            <Reveal key={product.name} delay={i * 100}>
              <a
                href={product.href}
                className="group relative flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-surface p-8 transition hover:border-white/20 hover:bg-white/[0.06] sm:p-10"
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
