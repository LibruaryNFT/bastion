"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useDemo } from "@/app/page";
import { PublicKey } from "@solana/web3.js";
import { bastionClient } from "@/lib/program";

interface TravelRuleData {
  originatorName: string;
  originatorAddress: string;
  originatorInstitution: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryInstitution: string;
  transmissionStatus: "pending" | "transmitting" | "ack_received" | "failed";
}

interface WithdrawalPanelProps {
  vaultAddress: PublicKey;
}

interface TransactionRecord {
  id: number;
  amount: number;
  recipient: string;
  status: "executed" | "rejected" | "pending";
  time: string;
  signature?: string;
}

const MOCK_PENDING = [
  {
    id: 45,
    requester: "David Kim",
    requesterWallet: "5cHU...r8Nj",
    recipient: "External: 8fKL...v3Wq",
    amount: 75_000,
    memo: "Q1 vendor payment — invoice #INV-2026-0342",
    approvals: 1,
    threshold: 2,
    travelRule: true,
    createdAt: "8h ago",
  },
  {
    id: 44,
    requester: "Bob Martinez",
    requesterWallet: "9aFR...n7Ks",
    recipient: "External: 2mNP...x5Yr",
    amount: 45_000,
    memo: "Monthly payroll disbursement — March 2026",
    approvals: 0,
    threshold: 2,
    travelRule: true,
    createdAt: "1d ago",
  },
];

const MOCK_HISTORY: TransactionRecord[] = [
  { id: 46, amount: 15_000, recipient: "0xDEf...5678", status: "executed", time: "5h ago" },
  { id: 43, amount: 200_000, recipient: "0x123...4567", status: "executed", time: "3d ago" },
  { id: 40, amount: 50_000, recipient: "0xABC...DEF0", status: "rejected", time: "5d ago" },
];

export function WithdrawalPanel({ vaultAddress }: WithdrawalPanelProps) {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { isDemo } = useDemo();

  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({ recipient: "", amount: "", memo: "" });
  const [travelRuleData, setTravelRuleData] = useState<TravelRuleData>({
    originatorName: "Treasury Operations Vault",
    originatorAddress: "7xKX...m4Qp",
    originatorInstitution: "Bastion Institutional Vault",
    beneficiaryName: "",
    beneficiaryAddress: "",
    beneficiaryInstitution: "",
    transmissionStatus: "pending",
  });
  const [showTravelRuleForm, setShowTravelRuleForm] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>(MOCK_HISTORY);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const needsTravelRule = Number(newRequest.amount) >= 1000; // FATF Rec. 16: USD/EUR 1,000. Swiss/EU: configurable to 0


  // Handle request withdrawal
  const handleRequestWithdrawal = async () => {
    if (isDemo) {
      // Demo mode: show mock signature
      setSuccessMessage("✓ Demo withdrawal request created (mock signature: 3x4Kp9...demo)");
      setTimeout(() => setSuccessMessage(""), 5000);
      return;
    }

    if (!connected || !publicKey) {
      setErrorMessage("Connect wallet to submit on-chain transactions");
      return;
    }

    if (!newRequest.recipient || !newRequest.amount || !newRequest.memo) {
      setErrorMessage("Fill all fields");
      return;
    }

    if (needsTravelRule && travelRuleData.transmissionStatus !== "ack_received") {
      setErrorMessage("Complete Travel Rule transmission first");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const amount = Math.floor(Number(newRequest.amount) * 1_000_000); // Convert to smallest unit
      const recipient = new PublicKey(newRequest.recipient);

      const tx = await bastionClient.buildRequestWithdrawalTx(
        vaultAddress,
        publicKey,
        recipient,
        amount,
        newRequest.memo
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setSuccessMessage(`✓ Withdrawal request submitted!\nSignature: ${signature.slice(0, 20)}...`);

      // Add to history
      const newRecord: TransactionRecord = {
        id: Math.max(...transactionHistory.map((h) => h.id), 0) + 1,
        amount: Number(newRequest.amount),
        recipient: newRequest.recipient,
        status: "pending",
        time: "just now",
        signature,
      };
      setTransactionHistory([newRecord, ...transactionHistory]);

      // Reset form
      setNewRequest({ recipient: "", amount: "", memo: "" });
      setShowNewRequest(false);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrorMessage(`Transaction failed: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle approve
  const handleApprove = async (withdrawalId: number) => {
    if (isDemo) {
      setSuccessMessage(`✓ Demo approval submitted (mock signature: 5x8Np2...demo)`);
      setTimeout(() => setSuccessMessage(""), 5000);
      return;
    }

    if (!connected || !publicKey) {
      setErrorMessage("Connect wallet to submit on-chain transactions");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Derive withdrawal PDA from vault + transaction ID
      const [withdrawalAddress] = await bastionClient.getWithdrawalPDA(vaultAddress, withdrawalId);

      const tx = await bastionClient.buildApproveWithdrawalTx(
        vaultAddress,
        publicKey,
        withdrawalAddress
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setSuccessMessage(`✓ Withdrawal approved!\nSignature: ${signature.slice(0, 20)}...\nView on Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

      const newRecord: TransactionRecord = {
        id: withdrawalId,
        amount: 0,
        recipient: "",
        status: "executed",
        time: "just now",
        signature,
      };
      setTransactionHistory([newRecord, ...transactionHistory]);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      setErrorMessage(`Approval failed: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)" }}>
          <p className="text-sm font-medium whitespace-pre-wrap">{successMessage}</p>
        </div>
      )}

      {/* Wallet Connection Status */}
      {!isDemo && !connected && (
        <div className="mb-4 p-4 rounded-lg border" style={{ borderColor: "var(--warning)", background: "rgba(255,167,38,0.1)" }}>
          <p className="text-sm" style={{ color: "var(--warning)" }}>
            ⚠ Connect wallet to submit on-chain transactions
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Withdrawals</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Request, approve, and track stablecoin withdrawals
          </p>
        </div>
        <button
          onClick={() => setShowNewRequest(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#000" }}
          disabled={loading}
        >
          + New Withdrawal Request
        </button>
      </div>

      {/* Pending Approvals */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--warning)" }}>
          Pending Approvals ({MOCK_PENDING.length})
        </h2>
        <div className="space-y-3">
          {MOCK_PENDING.map((w) => (
            <div
              key={w.id}
              className="p-5 rounded-xl border"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">${w.amount.toLocaleString()}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,167,38,0.15)", color: "var(--warning)" }}>
                      {w.approvals}/{w.threshold} approvals
                    </span>
                    {w.travelRule && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,71,87,0.15)", color: "var(--danger)" }}>
                        Travel Rule
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Requested by {w.requester} ({w.requesterWallet}) &middot; {w.createdAt}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(w.id)}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                    style={{ background: "var(--accent)", color: "#000" }}
                  >
                    {loading ? "Processing..." : "Approve"}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-semibold border disabled:opacity-50"
                    style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                    disabled={loading}
                  >
                    Reject
                  </button>
                </div>
              </div>
              <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                <p><strong>To:</strong> {w.recipient}</p>
                <p><strong>Memo:</strong> {w.memo}</p>
              </div>

              {/* Travel Rule Info (for qualifying transfers) */}
              {w.travelRule && (
                <div className="mt-3 p-4 rounded-lg border-2" style={{ borderColor: "var(--danger)", background: "rgba(239,68,68,0.05)" }}>
                  <p className="text-xs font-semibold mb-3 px-2 py-1 rounded w-fit" style={{ background: "var(--danger-dim)", color: "var(--danger)" }}>
                    TRAVEL RULE REQUIRED (FATF Recommendation 16)
                  </p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Originator:</span>
                      <p className="mt-0.5 ml-2">Treasury Operations Vault (7xKX...m4Qp)</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Beneficiary Address:</span>
                      <p className="mt-0.5 ml-2 font-mono">{w.recipient}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Transfer Purpose:</span>
                      <p className="mt-0.5 ml-2">{w.memo.split("—")[0].trim()}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Gateway Status:</span>
                      <p className="mt-0.5 ml-2">
                        <span style={{ color: "var(--warning)" }}>Notabene (Sandbox)</span> — Awaiting beneficiary institution details
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Transaction History</h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          {transactionHistory.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                No transactions yet
              </p>
            </div>
          ) : (
            transactionHistory.map((w) => (
              <div
                key={w.id}
                className="px-5 py-4 border-b last:border-b-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">↑</span>
                    <div>
                      <p className="font-medium text-xs">${w.amount.toLocaleString()} to {w.recipient}</p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{w.time}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: w.status === "executed" ? "var(--accent-dim)" : w.status === "pending" ? "rgba(255,167,38,0.15)" : "rgba(255,71,87,0.15)",
                      color: w.status === "executed" ? "var(--accent)" : w.status === "pending" ? "var(--warning)" : "var(--danger)",
                    }}
                  >
                    {w.status}
                  </span>
                </div>
                {w.signature && (
                  <div className="mt-2 ml-11">
                    <a
                      href={`https://explorer.solana.com/tx/${w.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono hover:underline"
                      style={{ color: "var(--accent)" }}
                    >
                      {w.signature.slice(0, 20)}... (View on Explorer)
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className="w-full max-w-md p-6 rounded-xl border"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            <h3 className="text-lg font-bold mb-4">New Withdrawal Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Recipient Wallet
                </label>
                <input
                  type="text"
                  value={newRequest.recipient}
                  onChange={(e) => setNewRequest({ ...newRequest, recipient: e.target.value })}
                  placeholder="Solana wallet address..."
                  className="w-full px-3 py-2 rounded-lg text-sm border font-mono"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={newRequest.amount}
                  onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Memo / Purpose
                </label>
                <textarea
                  value={newRequest.memo}
                  onChange={(e) => setNewRequest({ ...newRequest, memo: e.target.value })}
                  placeholder="e.g., Vendor payment — Invoice #INV-2026-0001"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm border resize-none"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              {needsTravelRule && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg text-xs" style={{ background: "rgba(255,71,87,0.1)", color: "var(--danger)" }}>
                    <strong>Travel Rule Required (FATF Rec. 16):</strong> This transfer requires full originator and beneficiary details.
                    <button
                      onClick={() => setShowTravelRuleForm(!showTravelRuleForm)}
                      className="block mt-2 underline"
                    >
                      {showTravelRuleForm ? "Hide details" : "Provide beneficiary details"}
                    </button>
                  </div>

                  {/* Travel Rule Form */}
                  {showTravelRuleForm && (
                    <div className="p-4 rounded-lg border-2" style={{ borderColor: "var(--danger)", background: "var(--bg-tertiary)" }}>
                      <h4 className="text-xs font-semibold mb-3">Travel Rule Data Collection</h4>
                      <div className="space-y-3 text-xs">
                        {/* Originator (Pre-filled) */}
                        <div>
                          <label className="block font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                            Originating Institution (Your Vault)
                          </label>
                          <input
                            type="text"
                            value={travelRuleData.originatorInstitution}
                            disabled
                            className="w-full px-2 py-1.5 rounded text-xs border"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                          />
                        </div>

                        {/* Beneficiary Fields */}
                        <div>
                          <label className="block font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                            Beneficiary Name (Individual or Entity)
                          </label>
                          <input
                            type="text"
                            value={travelRuleData.beneficiaryName}
                            onChange={(e) => setTravelRuleData({ ...travelRuleData, beneficiaryName: e.target.value })}
                            placeholder="Full legal name"
                            className="w-full px-2 py-1.5 rounded text-xs border"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                            Beneficiary Address
                          </label>
                          <input
                            type="text"
                            value={travelRuleData.beneficiaryAddress}
                            onChange={(e) => setTravelRuleData({ ...travelRuleData, beneficiaryAddress: e.target.value })}
                            placeholder="Street, city, country"
                            className="w-full px-2 py-1.5 rounded text-xs border"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                            Beneficiary Institution
                          </label>
                          <input
                            type="text"
                            value={travelRuleData.beneficiaryInstitution}
                            onChange={(e) => setTravelRuleData({ ...travelRuleData, beneficiaryInstitution: e.target.value })}
                            placeholder="Receiving exchange or bank"
                            className="w-full px-2 py-1.5 rounded text-xs border"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                          />
                        </div>

                        {/* Transmission Status */}
                        {travelRuleData.transmissionStatus !== "pending" && (
                          <div className="p-2 rounded" style={{ background: "var(--accent-dim)" }}>
                            <p className="text-xs font-medium mb-1">Transmission Status:</p>
                            {travelRuleData.transmissionStatus === "transmitting" && (
                              <p style={{ color: "var(--warning)" }}>
                                🔄 Transmitting to {travelRuleData.beneficiaryInstitution || "beneficiary VASP"}...
                              </p>
                            )}
                            {travelRuleData.transmissionStatus === "ack_received" && (
                              <p style={{ color: "var(--success)" }}>
                                ✓ ACK received from beneficiary VASP — Transfer approved
                              </p>
                            )}
                            {travelRuleData.transmissionStatus === "failed" && (
                              <p style={{ color: "var(--danger)" }}>
                                ✗ Transmission failed — Incomplete beneficiary details
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (travelRuleData.beneficiaryName && travelRuleData.beneficiaryAddress && travelRuleData.beneficiaryInstitution) {
                            setTravelRuleData({ ...travelRuleData, transmissionStatus: "transmitting" });
                            setTimeout(() => {
                              setTravelRuleData({ ...travelRuleData, transmissionStatus: "ack_received" });
                            }, 2000);
                          } else {
                            setTravelRuleData({ ...travelRuleData, transmissionStatus: "failed" });
                          }
                        }}
                        className="w-full mt-3 px-3 py-1.5 rounded text-xs font-semibold"
                        style={{ background: "var(--accent)", color: "#000" }}
                      >
                        Transmit to Notabene Gateway
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewRequest(false);
                  setShowTravelRuleForm(false);
                  setErrorMessage("");
                }}
                className="flex-1 py-2.5 rounded-lg text-sm border disabled:opacity-50"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestWithdrawal}
                disabled={
                  loading ||
                  !newRequest.recipient ||
                  !newRequest.amount ||
                  !newRequest.memo ||
                  (needsTravelRule && travelRuleData.transmissionStatus !== "ack_received")
                }
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                {loading ? "Processing..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
