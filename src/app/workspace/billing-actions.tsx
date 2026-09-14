"use client";

export function ChangePlanButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Plan changes aren't available yet.")}
      className="ws-btn-primary rounded-[8px] text-[12.5px] font-semibold"
      style={{ padding: "10px 14px" }}
    >
      Change plan
    </button>
  );
}

export function CancelPlanButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Cancel your Studio plan? You'll lose access to Outlier and Signal at the end of the current period.")) {
          alert("Plan cancellation isn't available yet.");
        }
      }}
      className="rounded-[8px] text-[12.5px] font-medium"
      style={{
        padding: "10px 14px",
        background: "transparent",
        color: "var(--ws-accent-tint-ink)",
        border: "1px solid var(--ws-accent-tint-border)",
      }}
    >
      Cancel
    </button>
  );
}

export function UpdatePaymentButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Updating payment methods isn't available yet.")}
      className="ws-link-accent whitespace-nowrap text-[11.5px] font-medium"
    >
      Update
    </button>
  );
}

export function DownloadInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Invoice downloads aren't available yet.")}
      className="ws-link-accent text-[11.5px] font-medium"
      aria-label="Download invoice"
    >
      ↓
    </button>
  );
}

export function DownloadAllButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Invoice downloads aren't available yet.")}
      className="ws-link-accent text-[11.5px] font-medium"
    >
      Download all
    </button>
  );
}
