"use client";

export function ConnectButton({ label = "Connect" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => alert("Connecting accounts isn't available yet.")}
      className="ws-link-accent whitespace-nowrap text-[11.5px] font-medium"
    >
      {label}
    </button>
  );
}

export function DeleteAccountButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (
          confirm(
            "Delete your Creos Labs account? This removes access to Outlier and Signal and can't be undone."
          )
        ) {
          alert("Account deletion isn't available yet.");
        }
      }}
      className="rounded-[8px] text-[12.5px] font-medium"
      style={{
        padding: "10px 14px",
        background: "transparent",
        color: "var(--ws-warn-text)",
        border: "1px solid var(--ws-hairline-strong)",
      }}
    >
      Delete account
    </button>
  );
}
