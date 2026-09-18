"use client";

export function ChoosePlanButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Plans aren't available yet.")}
      className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "10px 14px" }}
    >
      Choose a plan
    </button>
  );
}

export function AddPaymentButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Adding a payment method isn't available yet.")}
      className="ws-link-accent whitespace-nowrap text-[11.5px] font-medium"
    >
      Add
    </button>
  );
}
