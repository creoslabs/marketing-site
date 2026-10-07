"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Chip, appStyles as s } from "@/components/app/ui";

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

function Key({ children }: { children: React.ReactNode }) {
  return <span className={s.setKey}>{children}</span>;
}

function Actions({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <>
      <Button type="submit" variant="primary" size="sm" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </>
  );
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

  return (
    <div className={s.setRow}>
      <Key>Name</Key>
      {editing ? (
        <form onSubmit={handleSave} className={s.setForm}>
          <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} className={s.input} style={{ flex: 1, maxWidth: 300 }} aria-label="Name" />
          <Actions
            saving={saving}
            onCancel={() => {
              setDraft(value);
              setError("");
              setEditing(false);
            }}
          />
        </form>
      ) : (
        <>
          <span className={s.setVal}>{value}</span>
          <Button variant="link" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </>
      )}
      {error && <p className={s.setError}>{error}</p>}
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
    <div className={s.setRow}>
      <Key>Email</Key>
      {editing ? (
        <form onSubmit={handleSave} className={s.setForm}>
          <input
            autoFocus
            type="email"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={s.input}
            style={{ flex: 1, maxWidth: 300 }}
            aria-label="Email"
          />
          <Actions
            saving={saving}
            onCancel={() => {
              setDraft(initialValue);
              setError("");
              setEditing(false);
            }}
          />
        </form>
      ) : (
        <>
          <span className={s.setVal}>{initialValue || "—"}</span>
          <Button
            variant="link"
            onClick={() => {
              setDraft(initialValue);
              setEditing(true);
            }}
          >
            Edit
          </Button>
        </>
      )}
      {error && <p className={s.setError}>{error}</p>}
      {pendingEmail && <p className={s.setOk}>Confirmation sent to {pendingEmail} — your sign-in email won&apos;t change until you confirm it.</p>}
    </div>
  );
}

export function EditableApiKeyRow({
  label,
  metaKey,
  initialIsSet,
  placeholder = "sk-…",
  problem,
}: {
  label: string;
  metaKey: string;
  initialIsSet: boolean;
  placeholder?: string;
  // A known problem with this key (e.g. "Limit reached") shown as a fail chip.
  problem?: string;
}) {
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
      data: { [metaKey]: value },
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

  return (
    <div className={s.setRow}>
      <Key>{label}</Key>
      {editing ? (
        <form onSubmit={handleSave} className={s.setForm}>
          <input
            autoFocus
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={s.input}
            style={{ flex: 1, maxWidth: 340 }}
            aria-label={label}
          />
          <Actions
            saving={saving}
            onCancel={() => {
              setDraft("");
              setError("");
              setEditing(false);
            }}
          />
        </form>
      ) : (
        <>
          <span className={s.setVal} style={isSet ? undefined : { color: "var(--ws-ink-45)" }}>
            {isSet ? (
              <span className={s.mono} style={{ fontSize: 12, letterSpacing: "0.2em" }}>
                ••••••••••••
              </span>
            ) : (
              "Not set"
            )}
          </span>
          {isSet && <Chip variant={problem ? "fail" : "soft"}>{problem ?? "Set"}</Chip>}
          <Button variant="link" onClick={() => setEditing(true)}>
            {isSet ? "Change" : "Set"}
          </Button>
          {isSet && (
            <Button variant="linkDanger" onClick={() => save(null)} disabled={saving}>
              Remove
            </Button>
          )}
        </>
      )}
      {error && <p className={s.setError}>{error}</p>}
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
    <div className={s.setRow}>
      <Key>Password</Key>
      {editing ? (
        <form onSubmit={handleSave} className={s.setForm}>
          <input
            autoFocus
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={s.input}
            style={{ width: 180 }}
            aria-label="New password"
          />
          <input
            type="password"
            placeholder="Confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={s.input}
            style={{ width: 160 }}
            aria-label="Confirm new password"
          />
          <Actions
            saving={saving}
            onCancel={() => {
              setPassword("");
              setConfirm("");
              setError("");
              setEditing(false);
            }}
          />
        </form>
      ) : (
        <>
          <span className={s.setVal}>••••••••••</span>
          <Button variant="link" onClick={() => setEditing(true)}>
            Change
          </Button>
        </>
      )}
      {error && <p className={s.setError}>{error}</p>}
      {success && <p className={s.setOk}>Password updated.</p>}
    </div>
  );
}
