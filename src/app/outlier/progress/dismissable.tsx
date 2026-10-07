"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/app/ui";

const KEY = "outlier-progress-dismissed";
const EVENT = "outlier-progress-dismissed-changed";

function read() {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

// Hides a failure group on this device until a newer failure arrives — the
// signature changes whenever the group gains a job, so it comes back if the
// problem recurs.
export function DismissableGroup({ signature, children }: { signature: string; children: ReactNode }) {
  const dismissed = useSyncExternalStore(subscribe, read, () => "");
  if (dismissed.split("|").includes(signature)) return null;
  return <>{children}</>;
}

export function DismissButton({ signature }: { signature: string }) {
  return (
    <Button
      variant="ghost"
      onClick={() => {
        try {
          localStorage.setItem(KEY, [...read().split("|").filter(Boolean), signature].join("|"));
          window.dispatchEvent(new Event(EVENT));
        } catch {
          // blocked storage — nothing to do
        }
      }}
    >
      Dismiss
    </Button>
  );
}
