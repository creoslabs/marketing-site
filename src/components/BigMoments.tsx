import { Reveal } from "@/components/Reveal";

const MOMENTS = [
  { word: "RESEARCH.", body: "See what's actually outperforming across your niche — not just what already went viral." },
  { word: "ANALYSE.", body: "Check creative against what actually tends to work before you spend a dollar on it." },
  { word: "DECIDE.", body: "One clear answer per question, so the next move is obvious instead of a guess." },
];

// A deliberate scale break after the two product sections — each word gets
// most of a screen to itself instead of sitting inside the same small
// eyebrow-headline-copy rhythm as everything else on the page.
export default function BigMoments() {
  return (
    <section className="relative border-t border-white/10">
      {MOMENTS.map((m) => (
        <div key={m.word} className="flex min-h-[62vh] items-center justify-center px-6 py-16">
          <Reveal className="text-center">
            <p className="text-[16vw] font-bold leading-none tracking-tight text-foreground sm:text-[9rem]">
              {m.word}
            </p>
            <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-muted">{m.body}</p>
          </Reveal>
        </div>
      ))}
    </section>
  );
}
