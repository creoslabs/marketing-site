import Link from "next/link";
import type { Creator, Post } from "./data";
import { AddCreatorButton, PullHandlesButton } from "./creator-actions";

type Step = { label: string; description: string; done: boolean };

function StepRow({ step, index, isCurrent, action }: { step: Step; index: number; isCurrent: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[14px]" style={{ padding: "12px 0" }}>
      <span
        className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
        style={
          step.done
            ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
            : isCurrent
              ? { border: "1.5px solid var(--ws-accent)", color: "var(--ws-accent-text)" }
              : { border: "1.5px solid var(--ws-hairline)", color: "var(--ws-ink-45)" }
        }
      >
        {step.done ? "✓" : index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] font-medium"
          style={{ color: step.done ? "var(--ws-ink-45)" : "var(--ws-ink)", textDecoration: step.done ? "line-through" : "none" }}
        >
          {step.label}
        </p>
        <p className="mt-[2px] text-[11.5px]" style={{ color: "var(--ws-ink-45)" }}>
          {step.description}
        </p>
      </div>
      {isCurrent && action}
    </div>
  );
}

// Shown until all three steps are done, then never again — this is a
// first-run aid, not a permanent dashboard fixture.
export function OnboardingChecklist({ creators, posts }: { creators: Creator[]; posts: Post[] }) {
  const hasCreator = creators.length > 0;
  const hasPost = posts.length > 0;
  const hasAnalyzed = posts.some((p) => p.analysisStatus === "done");

  if (hasCreator && hasPost && hasAnalyzed) return null;

  const allHandles = creators.flatMap((c) => c.handles);
  const bestPost = posts.length > 0 ? [...posts].sort((a, b) => b.score - a.score)[0] : null;

  const steps: Step[] = [
    { label: "Track a creator", description: "Add someone by handle to start scoring their posts.", done: hasCreator },
    { label: "Pull their posts", description: "Fetch their recent history to compute a real median.", done: hasPost },
    { label: "Analyze your first outlier", description: "Transcribe and break down the structure of your best pull.", done: hasAnalyzed },
  ];

  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="ws-card mb-[18px]" style={{ padding: "16px 20px" }}>
      <p className="ws-eyebrow">GET STARTED</p>
      <div className="mt-[4px] flex flex-col" style={{ marginTop: 8 }}>
        {steps.map((step, i) => (
          <StepRow
            key={step.label}
            step={step}
            index={i}
            isCurrent={i === currentIndex}
            action={
              i === 0 ? (
                <AddCreatorButton className="ws-btn-primary shrink-0 rounded-[7px] text-[12px] font-semibold" style={{ padding: "8px 12px" }}>
                  + Add creator
                </AddCreatorButton>
              ) : i === 1 ? (
                <PullHandlesButton
                  handles={allHandles}
                  className="ws-btn-primary shrink-0 rounded-[7px] text-[12px] font-semibold"
                  style={{ padding: "8px 12px" }}
                >
                  Pull now
                </PullHandlesButton>
              ) : bestPost ? (
                <Link
                  href={`/outlier/video/${bestPost.id}`}
                  className="ws-btn-primary shrink-0 rounded-[7px] text-[12px] font-semibold"
                  style={{ padding: "8px 12px" }}
                >
                  Open top post
                </Link>
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
