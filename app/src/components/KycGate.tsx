"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface KycGateProps {
  onVerified: () => void;
}

export function KycGate({ onVerified }: KycGateProps) {
  const { publicKey } = useWallet();
  const [step, setStep] = useState<"info" | "identity" | "webcam" | "verifying" | "done" | "failed">("info");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
    idType: "passport",
    entityType: "individual",
    companyName: "",
  });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [verificationSteps, setVerificationSteps] = useState<Record<string, boolean>>({});
  const [kycRef, setKycRef] = useState<string>("");
  const [screeningProvider, setScreeningProvider] = useState<string>("");

  // Simulate document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Reject if name contains "Fraud"
    if (form.fullName.toLowerCase().includes("fraud")) {
      setStep("failed");
      return;
    }

    setStep("webcam");
    await new Promise((r) => setTimeout(r, 3000));
    setStep("verifying");

    // Simulate multi-step verification process
    const steps = [
      { key: "doc_check", label: "Document verification" },
      { key: "face_match", label: "Face match" },
      { key: "sanctions", label: "Sanctions screening" },
      { key: "aml", label: "AML risk assessment" },
    ];

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
      setVerificationSteps((prev) => ({ ...prev, [step.key]: true }));
    }

    // Generate realistic reference IDs
    const ref = `KYC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const provider = `Onfido-SBX-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setKycRef(ref);
    setScreeningProvider(provider);

    await new Promise((r) => setTimeout(r, 1000));
    setStep("done");
    setTimeout(onVerified, 2000);
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
              <label
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[var(--accent)] transition-colors block"
                style={{ borderColor: uploadedFile ? "var(--accent)" : "var(--border)" }}
              >
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
                <div className="text-3xl mb-2">{uploadedFile ? "✓" : "📄"}</div>
                {uploadedFile ? (
                  <>
                    <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                      {uploadedFile}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--success)" }}>Document ready for processing</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Drop document here or click to upload</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      PNG, JPG, or PDF (max 10MB)
                    </p>
                  </>
                )}
              </label>

              <div className="p-3 rounded-lg text-xs" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                <strong>Provider:</strong> Onfido Sandbox Integration
                <br />
                <strong>Privacy:</strong> Documents are encrypted in transit and not stored on-chain.
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!uploadedFile}
              className="w-full mt-6 py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              Continue to Face Capture
            </button>
          </>
        )}

        {step === "webcam" && (
          <div className="text-center py-8">
            <div className="mb-6 p-6 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
              <div className="text-5xl mb-4">📷</div>
              <h2 className="text-xl font-bold mb-2">Liveness Verification</h2>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                Please ensure proper lighting and face is clearly visible
              </p>
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
                <span style={{ color: "var(--text-secondary)" }}>Webcam Preview (Sandbox)</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Capturing face match data...
              </p>
            </div>
            <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              Processing facial biometrics
            </p>
          </div>
        )}

        {step === "verifying" && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-2">Running Verification Checks</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Processing KYC/AML screening (8-10 seconds)
            </p>
            <div className="mt-4 space-y-3 text-left max-w-sm mx-auto">
              {[
                { key: "doc_check", label: "Identity document verification" },
                { key: "face_match", label: "Facial recognition & liveness" },
                { key: "sanctions", label: "OFAC/EU sanctions list screening" },
                { key: "aml", label: "AML risk assessment" },
              ].map((check) => (
                <div key={check.key} className="flex items-center gap-3 text-xs p-2 rounded" style={{ background: "var(--bg-tertiary)" }}>
                  {verificationSteps[check.key] ? (
                    <span style={{ color: "var(--success)" }}>✓</span>
                  ) : (
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
                    />
                  )}
                  <span style={{ color: verificationSteps[check.key] ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "failed" && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✗</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--danger)" }}>
              Verification Failed
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              The provided identity information failed our compliance screening.
            </p>
            <div className="p-4 rounded-lg text-xs text-left mb-6" style={{ background: "var(--danger-dim)", color: "var(--danger)" }}>
              <p className="font-medium mb-2">Reason: Individual fails sanctions screening</p>
              <p>If you believe this is an error, please contact support@bastion.vault</p>
            </div>
            <button
              onClick={() => {
                setStep("info");
                setForm({ ...form, fullName: "" });
                setVerificationSteps({});
              }}
              className="w-full py-2.5 rounded-lg font-semibold text-sm border"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              Try Again with Different Name
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--success)" }}>
              KYC Verification Complete
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Your identity has been verified and approved.
            </p>

            {/* Verification Details */}
            <div className="space-y-3 text-left mb-6 p-4 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-secondary)" }}>KYC Reference:</span>
                <span className="font-mono">{kycRef}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-secondary)" }}>Provider:</span>
                <span className="font-mono">{screeningProvider}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-secondary)" }}>Status:</span>
                <span style={{ color: "var(--success)" }}>Approved</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-secondary)" }}>Wallet:</span>
                <span className="font-mono">{publicKey?.toBase58().slice(0, 16)}...</span>
              </div>
            </div>

            <div className="p-2 rounded-lg text-xs" style={{ background: "var(--success-dim)", color: "var(--success)" }}>
              Your wallet is now approved for vault access. Proceeding to dashboard...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
