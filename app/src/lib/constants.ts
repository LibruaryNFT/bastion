export const PROGRAM_ID = "3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv";
export const DEVNET_RPC = "https://api.devnet.solana.com";
export const SOLANA_EXPLORER_BASE = "https://explorer.solana.com";

export const EXPLORER_URLS = {
  devnet: {
    tx: (signature: string) => `${SOLANA_EXPLORER_BASE}/tx/${signature}?cluster=devnet`,
    account: (address: string) => `${SOLANA_EXPLORER_BASE}/address/${address}?cluster=devnet`,
    program: `${SOLANA_EXPLORER_BASE}/address/${PROGRAM_ID}?cluster=devnet`,
  },
};

export const ROLES = {
  Admin: 0,
  Manager: 1,
  Operator: 2,
  Viewer: 3,
} as const;

export const ROLE_NAMES = {
  0: "Admin",
  1: "Manager",
  2: "Operator",
  3: "Viewer",
} as const;

export const ROLE_PERMISSIONS = {
  Admin: "Full control: add members, verify KYC, unlimited operations",
  Manager: "Approve withdrawals, 50% daily limit",
  Operator: "Request withdrawals, 10% daily limit",
  Viewer: "Read-only access, no transactions",
} as const;
