import { DotPattern } from "@/components/ui/dot-pattern";
import { Reveal } from "@/components/Reveal";

const VALUES = [
  {
    title: "Built for you, not off-the-shelf",
    description: "Every solution is engineered around how your business actually works, not squeezed into a generic template.",
  },
  {
    title: "Engineering first",
    description: "Decisions start with how something works, not how it looks in a deck.",
  },
  {
    title: "Small team, direct access",
    description: "You work directly with the people building your solution — no account managers in between.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden border-t border-white/10 py-28">
      <DotPattern
        className="fill-white/10 md:fill-white/[0.08] [mask-image:radial-gradient(560px_circle_at_center,white,transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-16 md:grid-cols-2">
          <Reveal>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-blue">
              About Creos Labs
            </h2>
            <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              A technology company for custom marketing solutions.
            </p>
            <p className="mt-6 leading-relaxed text-muted">
              Creos Labs designs and builds custom marketing technology for
              businesses — including Creos, our business management
              platform for creators, and Content Lab, our competitor
              content analysis tool. We work as an extension of your team,
              engineering solutions built specifically for how you operate.
            </p>
          </Reveal>

          <Reveal delay={150} className="flex flex-col gap-8">
            {VALUES.map((value, i) => (
              <div key={value.title} className="flex gap-5">
                <span className="text-2xl font-semibold text-accent-blue">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold">{value.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
