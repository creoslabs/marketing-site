"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ws-toast";
import { Button } from "@/components/app/ui";

export function SignOutOthersButton() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    let supabase;
    try {
      supabase = createClient();
    } catch {
      toast("Supabase isn't configured yet.", "error");
      setPending(false);
      return;
    }
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setPending(false);
    toast(error ? "Couldn't sign out other sessions." : "Signed out everywhere else.", error ? "error" : "success");
  }

  return (
    <Button variant="link" onClick={handleClick} disabled={pending}>
      {pending ? "Signing out…" : "Sign out others"}
    </Button>
  );
}
