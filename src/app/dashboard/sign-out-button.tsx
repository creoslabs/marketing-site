"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LiquidButton } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <LiquidButton
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleSignOut}
      className="rounded-full"
    >
      Sign out
    </LiquidButton>
  );
}
