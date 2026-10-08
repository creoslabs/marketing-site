"use client";

import { useState } from "react";
import Link from "next/link";
import { appStyles as s, Chip, cx } from "@/components/app/ui";
import { Icon } from "@/components/app/icons";
import { createClient } from "@/lib/supabase/client";

// One-time nudge: "Want these in Slack?" Dismissing (or following the link)
// is remembered on the account so it never comes back.
export function IntegrationPromptBar({ href, text }: { href: string; text: string }) {
  const [hidden, setHidden] = useState(false);

  async function remember() {
    setHidden(true);
    try {
      await createClient().auth.updateUser({ data: { integrations_prompt_dismissed: true } });
    } catch {
      // Not configured / offline — it simply shows again next visit.
    }
  }

  if (hidden) return null;
  return (
    <div className={s.announce} role="status">
      <Chip variant="accent">New</Chip>
      <span className={s.announceText}>{text}</span>
      <Link href={href} className={s.announceLink} onClick={remember}>
        Set up Slack →
      </Link>
      <button type="button" className={cx(s.announceClose)} aria-label="Dismiss" onClick={remember}>
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
