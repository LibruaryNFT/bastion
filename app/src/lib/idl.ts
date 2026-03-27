import { Buffer } from "buffer";
import BN from "bn.js";

/**
 * Manual IDL derived from Bastion Rust program
 * Since we used cargo build-sbf (not anchor build), we build raw transactions
 * with computed instruction discriminators and borsh deserialization
 */

// ============================================================================
// Instruction Discriminators
// ============================================================================
// Each Anchor instruction has a discriminator: first 8 bytes of sha256("global:<instruction_name>")

export const INSTRUCTION_DISCRIMINATORS = {
  initialize_vault: Buffer.from([233, 70, 201, 112, 182, 226, 230, 146]),
  add_member: Buffer.from([89, 198, 28, 252, 85, 189, 210, 226]),
  verify_kyc: Buffer.from([112, 205, 49, 98, 207, 238, 28, 196]),
  deposit: Buffer.from([242, 35, 198, 137, 82, 225, 242, 20]),
  request_withdrawal: Buffer.from([250, 179, 193, 71, 164, 72, 167, 217]),
  approve_withdrawal: Buffer.from([84, 154, 84, 127, 183, 70, 69, 47]),
  execute_withdrawal: Buffer.from([201, 106, 158, 116, 141, 112, 111, 149]),
  pause_vault: Buffer.from([223, 128, 42, 233, 140, 27, 138, 253]),
  unpause_vault: Buffer.from([126, 42, 176, 196, 83, 40, 149, 154]),
  transfer_hook: Buffer.from([62, 97, 125, 10, 205, 213, 141, 28]),
  create_kyc_attestation: Buffer.from([45, 29, 227, 198, 105, 18, 144, 215]),
  update_kyc_attestation: Buffer.from([72, 245, 166, 183, 85, 45, 29, 73]),
  submit_travel_rule_data: Buffer.from([52, 179, 109, 234, 172, 253, 245, 15]),
  initialize_token_limit: Buffer.from([184, 12, 248, 89, 115, 101, 29, 126]),
};

// ============================================================================
// Account Discriminators
// ============================================================================
// First 8 bytes of sha256("account:<AccountName>")

export const ACCOUNT_DISCRIMINATORS = {
  Vault: Buffer.from([140, 8, 14, 76, 180, 174, 189, 156]),
  Member: Buffer.from([164, 93, 186, 151, 186, 85, 242, 154]),
  Withdrawal: Buffer.from([216, 218, 119, 191, 131, 227, 200, 49]),
  KycAttestation: Buffer.from([224, 175, 174, 217, 133, 160, 189, 77]),
  TravelRuleData: Buffer.from([104, 18, 248, 75, 63, 70, 252, 109]),
  TokenLimitState: Buffer.from([227, 248, 108, 217, 207, 242, 45, 237]),
};

// ============================================================================
// Account Structures (Borsh-compatible)
// ============================================================================

export interface Vault {
  authority: string; // Pubkey (32 bytes)
  name: string;
  dailyLimit: BN;
  approvalThreshold: number;
  totalDeposited: BN;
  totalWithdrawn: BN;
  memberCount: number;
  transactionCount: BN;
  createdAt: BN;
  paused: boolean;
  bump: number;
}

export interface Member {
  vault: string; // Pubkey (32 bytes)
  wallet: string; // Pubkey (32 bytes)
  role: number;
  kycVerified: boolean;
  dailySpent: BN;
  lastReset: BN;
  joinedAt: BN;
  bump: number;
}

export interface Withdrawal {
  vault: string; // Pubkey (32 bytes)
  requester: string; // Pubkey (32 bytes)
  recipient: string; // Pubkey (32 bytes)
  amount: BN;
  memo: string;
  approvals: number;
  executed: boolean;
  rejected: boolean;
  needsApproval: boolean;
  transactionId: BN;
  createdAt: BN;
  bump: number;
}

export interface KycAttestation {
  wallet: string; // Pubkey (32 bytes)
  verified: boolean;
  provider: string;
  verifiedAt: BN;
  expiry: BN;
  bump: number;
}

export interface TravelRuleData {
  originator: string; // Pubkey
  originatorName: string;
  originatorAddress: string;
  beneficiary: string; // Pubkey
  beneficiaryName: string;
  beneficiaryAddress: string;
  txReference: string;
  isFilled: boolean;
  submittedAt: BN;
  bump: number;
}

export interface TokenLimitState {
  wallet: string; // Pubkey
  dailyLimit: BN;
  dailyTransferred: BN;
  lastTransferReset: BN;
  bump: number;
}

// ============================================================================
// Borsh Deserialization Helpers
// ============================================================================

export function deserializePubkey(data: Buffer, offset: number): string {
  return data.slice(offset, offset + 32).toString("base64");
}

export function deserializeString(data: Buffer, offset: number): { value: string; newOffset: number } {
  const length = data.readUInt32LE(offset);
  const value = data.slice(offset + 4, offset + 4 + length).toString("utf-8");
  return { value, newOffset: offset + 4 + length };
}

export function deserializeU64(data: Buffer, offset: number): BN {
  return new BN(data.slice(offset, offset + 8), "le");
}

export function deserializeU16(data: Buffer, offset: number): number {
  return data.readUInt16LE(offset);
}

export function deserializeU8(data: Buffer, offset: number): number {
  return data.readUInt8(offset);
}

export function deserializeBoolean(data: Buffer, offset: number): boolean {
  return data.readUInt8(offset) !== 0;
}

// ============================================================================
// Vault Deserialization
// ============================================================================

export function deserializeVault(data: Buffer): Vault | null {
  try {
    if (data.length < 178) return null;

    let offset = 8; // Skip discriminator

    const authority = deserializePubkey(data, offset);
    offset += 32;

    const { value: name, newOffset } = deserializeString(data, offset);
    offset = newOffset;

    const dailyLimit = deserializeU64(data, offset);
    offset += 8;

    const approvalThreshold = deserializeU8(data, offset);
    offset += 1;

    const totalDeposited = deserializeU64(data, offset);
    offset += 8;

    const totalWithdrawn = deserializeU64(data, offset);
    offset += 8;

    const memberCount = deserializeU16(data, offset);
    offset += 2;

    const transactionCount = deserializeU64(data, offset);
    offset += 8;

    const createdAt = deserializeU64(data, offset);
    offset += 8;

    const paused = deserializeBoolean(data, offset);
    offset += 1;

    const bump = deserializeU8(data, offset);

    return {
      authority,
      name,
      dailyLimit,
      approvalThreshold,
      totalDeposited,
      totalWithdrawn,
      memberCount,
      transactionCount,
      createdAt,
      paused,
      bump,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Member Deserialization
// ============================================================================

export function deserializeMember(data: Buffer): Member | null {
  try {
    if (data.length < 139) return null;

    let offset = 8; // Skip discriminator

    const vault = deserializePubkey(data, offset);
    offset += 32;

    const wallet = deserializePubkey(data, offset);
    offset += 32;

    const role = deserializeU8(data, offset);
    offset += 1;

    const kycVerified = deserializeBoolean(data, offset);
    offset += 1;

    const dailySpent = deserializeU64(data, offset);
    offset += 8;

    const lastReset = deserializeU64(data, offset);
    offset += 8;

    const joinedAt = deserializeU64(data, offset);
    offset += 8;

    const bump = deserializeU8(data, offset);

    return {
      vault,
      wallet,
      role,
      kycVerified,
      dailySpent,
      lastReset,
      joinedAt,
      bump,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Withdrawal Deserialization
// ============================================================================

export function deserializeWithdrawal(data: Buffer): Withdrawal | null {
  try {
    if (data.length < 400) return null;

    let offset = 8; // Skip discriminator

    const vault = deserializePubkey(data, offset);
    offset += 32;

    const requester = deserializePubkey(data, offset);
    offset += 32;

    const recipient = deserializePubkey(data, offset);
    offset += 32;

    const amount = deserializeU64(data, offset);
    offset += 8;

    const { value: memo, newOffset } = deserializeString(data, offset);
    offset = newOffset;

    const approvals = deserializeU8(data, offset);
    offset += 1;

    const executed = deserializeBoolean(data, offset);
    offset += 1;

    const rejected = deserializeBoolean(data, offset);
    offset += 1;

    const needsApproval = deserializeBoolean(data, offset);
    offset += 1;

    const transactionId = deserializeU64(data, offset);
    offset += 8;

    const createdAt = deserializeU64(data, offset);
    offset += 8;

    const bump = deserializeU8(data, offset);

    return {
      vault,
      requester,
      recipient,
      amount,
      memo,
      approvals,
      executed,
      rejected,
      needsApproval,
      transactionId,
      createdAt,
      bump,
    };
  } catch {
    return null;
  }
}
