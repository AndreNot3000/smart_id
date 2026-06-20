"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Icon } from "@/components/dashboard";
import { getApiUrl } from "@/lib/config";

type SetupResponse = { otpauthUrl: string; secret: string };
type ConfirmResponse = { message: string; backupCodes: string[] };

export default function AdminMfaSettings() {
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisable, setShowDisable] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = useMemo(() => sessionStorage.getItem("accessToken"), []);

  const fetchStatus = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(getApiUrl("/api/users/profile"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to load profile");
      setMfaEnabled(Boolean(data.mfaEnabled));
    } catch (e: any) {
      setError(e.message || "Failed to load MFA status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSetup = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    setBackupCodes(null);
    try {
      const res = await fetch(getApiUrl("/api/users/mfa/setup"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as SetupResponse & { error?: string };
      if (!res.ok) throw new Error((data as any).error || "Failed to start MFA setup");
      setSetup({ otpauthUrl: data.otpauthUrl, secret: data.secret });
      setSuccess("Scan the QR code in your authenticator app, then enter the 6‑digit code below.");
    } catch (e: any) {
      setError(e.message || "Failed to start MFA setup");
    } finally {
      setBusy(false);
    }
  };

  const confirmSetup = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(getApiUrl("/api/users/mfa/confirm"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await res.json()) as ConfirmResponse & { error?: string };
      if (!res.ok) throw new Error((data as any).error || "Failed to confirm MFA");
      setBackupCodes(data.backupCodes);
      setSetup(null);
      setCode("");
      setMfaEnabled(true);
      setSuccess("MFA enabled. Save your backup codes somewhere safe (they won’t be shown again).");
    } catch (e: any) {
      setError(e.message || "Invalid authentication code");
    } finally {
      setBusy(false);
    }
  };

  const disableMfa = async () => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(getApiUrl("/api/users/mfa/disable"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword, code: disableCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to disable MFA");
      setMfaEnabled(false);
      setShowDisable(false);
      setDisablePassword("");
      setDisableCode("");
      setBackupCodes(null);
      setSuccess("MFA disabled.");
    } catch (e: any) {
      setError(e.message || "Failed to disable MFA");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="section-card text-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent)] border-t-transparent mx-auto mb-3" />
        <p className="text-[var(--text-muted)] text-sm">Loading security settings…</p>
      </div>
    );
  }

  return (
    <div className="section-card space-y-5">
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <Icon name="lock" size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="text-[var(--text-primary)] text-lg font-semibold tracking-tight">Admin MFA</h3>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Add a second step to admin login using an authenticator app (Google/Microsoft Authenticator).
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="pill text-[11px]"
            style={{
              background: mfaEnabled ? "color-mix(in srgb, var(--success) 16%, transparent)" : "color-mix(in srgb, var(--warning) 16%, transparent)",
              color: mfaEnabled ? "var(--success)" : "var(--warning)",
              border: `1px solid ${mfaEnabled ? "color-mix(in srgb, var(--success) 30%, transparent)" : "color-mix(in srgb, var(--warning) 30%, transparent)"}`,
            }}
          >
            {mfaEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {error && (
        <div
          className="flex items-start gap-2 text-sm p-3 rounded-lg"
          style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}
        >
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div
          className="flex items-start gap-2 text-sm p-3 rounded-lg"
          style={{ background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)" }}
        >
          <Icon name="check" size={16} />
          <span>{success}</span>
        </div>
      )}

      {!mfaEnabled && (
        <div className="space-y-4">
          {!setup ? (
            <button type="button" className="btn btn-primary" onClick={startSetup} disabled={busy}>
              <Icon name="plus" size={16} />
              Enable MFA
            </button>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[240px_1fr] items-start">
              <div className="rounded-xl p-4 border border-[var(--border-subtle)] bg-[var(--surface-1)]">
                <div className="bg-white rounded-lg p-3 w-fit mx-auto">
                  <QRCode value={setup.otpauthUrl} size={180} />
                </div>
                <p className="text-[var(--text-muted)] text-xs mt-3">
                  Can’t scan? Use the secret below.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="metric-label block mb-1.5">Secret key</label>
                  <input className="input w-full font-mono text-xs" readOnly value={setup.secret} />
                </div>
                <div>
                  <label className="metric-label block mb-1.5">6‑digit code</label>
                  <input
                    className="input w-full"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-primary" onClick={confirmSetup} disabled={busy || code.trim().length < 6}>
                    <Icon name="check" size={16} />
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setSetup(null);
                      setCode("");
                      setSuccess("");
                      setError("");
                    }}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {backupCodes?.length ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[var(--text-primary)] font-medium">Backup codes</p>
            <button
              type="button"
              className="btn btn-ghost text-xs"
              onClick={async () => {
                await navigator.clipboard.writeText(backupCodes.join("\n"));
                setSuccess("Backup codes copied.");
              }}
            >
              <Icon name="download" size={16} />
              Copy
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {backupCodes.map((c) => (
              <code key={c} className="px-3 py-2 rounded-lg bg-[var(--surface-0)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-primary)] font-mono">
                {c}
              </code>
            ))}
          </div>
          <p className="text-[var(--text-muted)] text-xs">
            Each backup code can be used once if you lose access to your authenticator app.
          </p>
        </div>
      ) : null}

      {mfaEnabled && (
        <div className="pt-1">
          {!showDisable ? (
            <button type="button" className="btn btn-ghost text-sm" onClick={() => setShowDisable(true)}>
              <Icon name="trash" size={16} />
              Disable MFA
            </button>
          ) : (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 space-y-3">
              <p className="text-[var(--text-primary)] font-medium">Disable MFA</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="metric-label block mb-1.5">Password</label>
                  <input className="input w-full" type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
                </div>
                <div>
                  <label className="metric-label block mb-1.5">Code (TOTP or backup)</label>
                  <input className="input w-full" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} placeholder="123456" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={disableMfa} disabled={busy || !disablePassword || !disableCode.trim()}>
                  <Icon name="check" size={16} />
                  Confirm disable
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowDisable(false)} disabled={busy}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

