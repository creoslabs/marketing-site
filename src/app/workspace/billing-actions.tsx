"use client";

import { useToast } from "@/components/ws-toast";
import { WsButton } from "@/components/ws-button";

export function ChoosePlanButton() {
  const toast = useToast();
  return (
    <WsButton variant="primary" onClick={() => toast("Founding access isn't open yet — join the waitlist from the homepage.")}>
      Get founding access
    </WsButton>
  );
}

export function AddPaymentButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast("Adding a payment method isn't available yet.")}
      className="ws-link-accent whitespace-nowrap text-[11.5px] font-medium"
    >
      Add
    </button>
  );
}

export function TalkToUsForTeamsLink() {
  return (
    <a
      href="mailto:hello@creos-labs.com?subject=Creos%20for%20teams"
      style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ws-accent-text)", whiteSpace: "nowrap" }}
    >
      Talk to us ↗
    </a>
  );
}
