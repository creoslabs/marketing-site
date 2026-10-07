import type { ReactNode } from "react";
import type { Creator, Post } from "./data";
import { AddCreatorButton, PullHandlesButton } from "./creator-actions";
import { Button, Card, CardHead, appStyles as s, cx } from "@/components/app/ui";

type Step = { label: string; description: string; done: boolean };

function StepRow({ step, index, isCurrent, action }: { step: Step; index: number; isCurrent: boolean; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderTop: index === 0 ? "none" : "1px solid var(--ws-hairline)" }}>
      <span
        className={cx(s.mono)}
        style={{
          width: 28,
          height: 28,
          flex: "none",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          ...(step.done
            ? { background: "var(--ws-accent)", color: "var(--ws-accent-ink)" }
            : isCurrent
              ? { border: "2px solid var(--ws-accent)", color: "var(--ws-accent)" }
              : { border: "1px solid var(--ws-hairline-strong)", color: "var(--ws-ink-45)" }),
        }}
        aria-hidden="true"
      >
        {step.done ? "✓" : index + 1}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: step.done ? "var(--ws-ink-45)" : "var(--ws-ink)", textDecoration: step.done ? "line-through" : "none" }}>
          {step.label}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ws-ink-45)" }}>{step.description}</p>
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

  const currentIndex = steps.findIndex((st) => !st.done);

  return (
    <Card paper ring style={{ gap: 8 }}>
      <CardHead label="Get started" paper />
      <div style={{ color: "var(--ws-ink)" }}>
        {/* Rows sit on paper, so re-theme their text locally. */}
        <div className={s.onboardPaper}>
          {steps.map((step, i) => (
            <StepRow
              key={step.label}
              step={step}
              index={i}
              isCurrent={i === currentIndex}
              action={
                i === 0 ? (
                  <AddCreatorButton variant="ink" size="sm">
                    Add creator
                  </AddCreatorButton>
                ) : i === 1 ? (
                  <PullHandlesButton handles={allHandles} variant="ink" size="sm">
                    Pull now
                  </PullHandlesButton>
                ) : bestPost ? (
                  <Button variant="ink" size="sm" href={`/outlier/video/${bestPost.id}`}>
                    Open top post
                  </Button>
                ) : undefined
              }
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
