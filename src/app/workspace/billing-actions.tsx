"use client";

import { useToast } from "@/components/ws-toast";

export function ChoosePlanButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast("Plans aren't available yet.")}
      className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "10px 14px" }}
    >
      Choose a plan
    </button>
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
