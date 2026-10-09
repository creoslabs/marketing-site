"use client";

import { useToast } from "@/components/ws-toast";
import { Button } from "@/components/app/ui";

export function AddPaymentButton() {
  const toast = useToast();
  return (
    <Button variant="ghost" size="sm" onClick={() => toast("Adding a payment method isn't available yet.")}>
      Add
    </Button>
  );
}

export function EditBillingButton() {
  const toast = useToast();
  return (
    <Button variant="link" onClick={() => toast("Editing billing details isn't available yet.")}>
      Edit
    </Button>
  );
}
