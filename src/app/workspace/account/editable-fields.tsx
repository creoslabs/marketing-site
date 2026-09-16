"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-[120px] shrink-0 text-[12.5px]" style={{ color: "var(--ws-ink-60)" }}>
      {children}
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 7,
  border: "1px solid var(--ws-hairline-strong)",
  background: "var(--ws-surface)",
  color: "var(--ws-ink)",
  fontSize: 12.5,
  outline: "none",
};

function SaveButton({ saving, children = "Save" }: { saving: boolean; children?: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="ws-btn-primary shrink-0 rounded-[7px] text-[11.5px] font-semibold"
      style={{ padding: "7px 10px", opacity: saving ? 0.6 : 1 }}
    >
      {saving ? "Saving…" : children}
    </button>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ws-btn-ghost shrink-0 rounded-[7px] text-[11.5px] font-medium"
      style={{ padding: "7px 10px" }}
    >
      Cancel
    </button>
  );
}

function ErrorText({ children }: { children: string }) {
  return (
    <p className="mt-[8px] pl-[130px] text-[11.5px]" style={{ color: "var(--ws-warn-text)" }}>
      {children}
    </p>
  );
}

const CONFIG_ERROR = "Supabase isn't configured yet — add your project URL and anon key to .env.local.";

// createClient() throws synchronously if Supabase isn't configured (invalid
// placeholder URL). Without this guard that throw happens mid-handler, after
// setSaving(true), leaving the button stuck on "Saving…" forever.
function tryCreateClient(): { client: ReturnType<typeof createClient> } | { error: string } {
  try {
    return { client: createClient() };
  } catch {
    return { error: CONFIG_ERROR };
  }
}

export function EditableNameRow({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Name can't be empty.");
      return;
    }
    setSaving(true);
    setError("");
    const result = tryCreateClient();
    if ("error" in result) {
      setSaving(false);
      setError(result.error);
      return;
    }
    const { error: updateError } = await result.client.auth.updateUser({ data: { full_name: trimmed } });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setValue(trimmed);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div style={{ padding: "16px 22px" }}>
        <form onSubmit={handleSave} className="flex items-center gap-[10px]">
          <RowLabel>Name</RowLabel>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ ...inputStyle, flex: 1, maxWidth: 280 }}
          />
          <SaveButton saving={saving} />
          <CancelButton
            onClick={() => {
              setDraft(value);
              setError("");
              setEditing(false);
            }}
          />
        </form>
        {error && <ErrorText>{error}</ErrorText>}
      </div>
    );
  }

  return (
    <div className="flex items-center" style={{ padding: "16px 22px" }}>
      <RowLabel>Name</RowLabel>
      <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
        {value}
      </span>
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="ws-link-accent text-[11.5px] font-medium"
      >
        Edit
      </button>
    </div>
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EditableEmailRow({ initialValue }: { initialValue: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    if (trimmed === initialValue) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    const result = tryCreateClient();
    if ("error" in result) {
      setSaving(false);
      setError(result.error);
      return;
    }
    const { error: updateError } = await result.client.auth.updateUser({ email: trimmed });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPendingEmail(trimmed);
    setEditing(false);
  }

  return (
    <div style={{ padding: "16px 22px" }}>
      {editing ? (
        <>
          <form onSubmit={handleSave} className="flex items-center gap-[10px]">
            <RowLabel>Email</RowLabel>
            <input
              autoFocus
              type="email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              style={{ ...inputStyle, flex: 1, maxWidth: 280 }}
            />
            <SaveButton saving={saving} />
            <CancelButton
              onClick={() => {
                setDraft(initialValue);
                setError("");
                setEditing(false);
              }}
            />
          </form>
          {error && <ErrorText>{error}</ErrorText>}
        </>
      ) : (
        <div className="flex items-center">
          <RowLabel>Email</RowLabel>
          <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
            {initialValue || "—"}
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => {
              setDraft(initialValue);
              setEditing(true);
            }}
            className="ws-link-accent text-[11.5px] font-medium"
          >
            Edit
          </button>
        </div>
      )}
      {pendingEmail && (
        <p className="mt-[8px] pl-[130px] text-[11.5px]" style={{ color: "var(--ws-accent-text)" }}>
          Confirmation sent to {pendingEmail} — your sign-in email won&apos;t change until you confirm it.
        </p>
      )}
    </div>
  );
}

export function EditableApiKeyRow({ label, initialIsSet }: { label: string; initialIsSet: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isSet, setIsSet] = useState(initialIsSet);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(value: string | null) {
    setSaving(true);
    setError("");
    const result = tryCreateClient();
    if ("error" in result) {
      setSaving(false);
      setError(result.error);
      return;
    }
    const { error: updateError } = await result.client.auth.updateUser({
      data: { signal_anthropic_api_key: value },
    });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setIsSet(Boolean(value));
    setDraft("");
    setEditing(false);
    router.refresh();
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Paste a key, or use Remove to clear it.");
      return;
    }
    await save(trimmed);
  }

  if (editing) {
    return (
      <div style={{ padding: "16px 22px" }}>
        <form onSubmit={handleSave} className="flex items-center gap-[10px]">
          <RowLabel>{label}</RowLabel>
          <input
            autoFocus
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ ...inputStyle, flex: 1, maxWidth: 320 }}
          />
          <SaveButton saving={saving} />
          <CancelButton
            onClick={() => {
              setDraft("");
              setError("");
              setEditing(false);
            }}
          />
        </form>
        {error && <ErrorText>{error}</ErrorText>}
      </div>
    );
  }

  return (
    <div className="flex items-center" style={{ padding: "16px 22px" }}>
      <RowLabel>{label}</RowLabel>
      <span className="text-[12.5px] font-medium" style={{ color: isSet ? "var(--ws-ink)" : "var(--ws-ink-45)" }}>
        {isSet ? "••••••••••••" : "Not set"}
      </span>
      <div className="flex-1" />
      {isSet && (
        <button
          type="button"
          onClick={() => save(null)}
          disabled={saving}
          className="mr-[14px] text-[11.5px] font-medium"
          style={{ color: "var(--ws-warn-text)", opacity: saving ? 0.6 : 1 }}
        >
          Remove
        </button>
      )}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="ws-link-accent text-[11.5px] font-medium"
      >
        {isSet ? "Change" : "Set"}
      </button>
    </div>
  );
}

export function EditablePasswordRow() {
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    setError("");
    const result = tryCreateClient();
    if ("error" in result) {
      setSaving(false);
      setError(result.error);
      return;
    }
    const { error: updateError } = await result.client.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword("");
    setConfirm("");
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <div style={{ padding: "16px 22px" }}>
      {editing ? (
        <>
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-[10px]">
            <RowLabel>Password</RowLabel>
            <input
              autoFocus
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, width: 160 }}
            />
            <input
              type="password"
              placeholder="Confirm"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ ...inputStyle, width: 140 }}
            />
            <SaveButton saving={saving} />
            <CancelButton
              onClick={() => {
                setPassword("");
                setConfirm("");
                setError("");
                setEditing(false);
              }}
            />
          </form>
          {error && <ErrorText>{error}</ErrorText>}
        </>
      ) : (
        <div className="flex items-center">
          <RowLabel>Password</RowLabel>
          <span className="text-[12.5px] font-medium" style={{ color: "var(--ws-ink)" }}>
            ••••••••
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ws-link-accent text-[11.5px] font-medium"
          >
            Change
          </button>
        </div>
      )}
      {success && (
        <p className="mt-[8px] pl-[130px] text-[11.5px]" style={{ color: "var(--ws-accent-text)" }}>
          Password updated.
        </p>
      )}
    </div>
  );
}
