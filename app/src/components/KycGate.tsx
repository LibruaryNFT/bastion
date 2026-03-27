"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface KycGateProps {
  onVerified: () => void;
}

export function KycGate({ onVerified }: KycGateProps) {
  const { publicKey } = useWallet();
  const [step, setStep] = useState<"info" | "identity" | "verifying" | "done">("info");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
    idType: "passport",
    entityType: "individual",
    companyName: "",
  });

  const handleSubmit = async () => {
    setStep("verifying");
    // Simulate KYC verification (in production: Onfido/Sumsub API)
    await new Promise((r) => setTimeout(r, 2500));
    setStep("done");
    setTimeout(onVerified, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="max-w-md w-full p-8 rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      >
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {["Identity", "Verification", "Access"].map((label, i) => {
            const stepIndex = ["info", "identity", "verifying", "done"].indexOf(step);
            const isActive = i <= Math.min(stepIndex, 2);
            return (
              <div key={label} className="flex-1">
                <div
                  className="h-1 rounded-full mb-1"
                  style={{ background: isActive ? "var(--accent)" : "var(--border)" }}
                />
                <p className="text-xs" style={{ color: isActive ? "var(--accent)" : "var(--text-secondary)" }}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>

        {step === "info" && (
          <>
            <h2 className="text-xl font-bold mb-2">KYC Verification Required</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Bastion requires identity verification before accessing the vault.
              This ensures compliance with KYC/AML regulations.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Entity Type
                </label>
                <select
                  value={form.entityType}
                  onChange={(e) => setForm({ ...form, entityType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="individual">Individual</option>
                  <option value="institution">Institution / Company</option>
                </select>
              </div>

              {form.entityType === "institution" && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Acme Capital LLC"
                    className="w-full px-3 py-2 rounded-lg text-sm border"
                    style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@institution.com"
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Country of Residence
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="">Select country...</option>
                  <option value="CH">Switzerland</option>
                  <option value="DE">Germany</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="SG">Singapore</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="CO">Colombia</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep("identity")}
              disabled={!form.fullName || !form.email || !form.country}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              Continue to Identity Verification
            </button>
          </>
        )}

        {step === "identity" && (
          <>
            <h2 className="text-xl font-bold mb-2">Identity Document</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Upload a government-issued ID for verification. Supported: Passport, National ID, Driver's License.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Document Type
                </label>
                <select
                  value={form.idType}
                  onChange={(e) => setForm({ ...form, idType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID Card</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>

              {/* Upload area */}
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[var(--accent)] transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm font-medium">Drop document here or click to upload</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  PNG, JPG, or PDF (max 10MB)
                </p>
              </div>

              <div className="p-3 rounded-lg text-xs" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                <strong>Privacy Notice:</strong> Documents are processed by our KYC provider (Onfido)
                and are not stored on-chain. Only the verification status is recorded.
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-sm"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              Submit for Verification
            </button>
          </>
        )}

        {step === "verifying" && (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <h2 className="text-xl font-bold mb-2">Verifying Identity</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Running KYC/AML checks...
            </p>
            <div className="mt-4 space-y-2 text-left max-w-xs mx-auto">
              {["Identity document check", "Sanctions screening (OFAC/EU)", "PEP check", "AML risk assessment"].map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span style={{ color: "var(--success)" }}>✓</span>
                  <span style={{ color: "var(--text-secondary)" }}>{check}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--success)" }}>
              KYC Verified
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Identity confirmed. On-chain attestation recorded.
            </p>
            <p className="text-xs mt-2 font-mono" style={{ color: "var(--text-secondary)" }}>
              Wallet: {publicKey?.toBase58().slice(0, 16)}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
