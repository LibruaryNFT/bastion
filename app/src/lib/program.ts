import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Signer,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";

import {
  INSTRUCTION_DISCRIMINATORS,
  deserializeVault,
  deserializeMember,
  deserializeWithdrawal,
  Vault,
  Member,
  Withdrawal,
} from "./idl";

export type { Vault, Member, Withdrawal };
import { PROGRAM_ID, DEVNET_RPC, ROLES } from "./constants";

export class BastionProgramClient {
  private connection: Connection;
  private programId: PublicKey;

  constructor(rpcUrl: string = DEVNET_RPC) {
    this.connection = new Connection(rpcUrl, "confirmed");
    this.programId = new PublicKey(PROGRAM_ID);
  }

  // ========================================================================
  // PDA Derivation
  // ========================================================================

  async getVaultPDA(authority: PublicKey, vaultName: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), authority.toBuffer(), Buffer.from(vaultName)],
      this.programId
    );
  }

  async getMemberPDA(vaultAddress: PublicKey, walletAddress: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("member"), vaultAddress.toBuffer(), walletAddress.toBuffer()],
      this.programId
    );
  }

  async getWithdrawalPDA(vaultAddress: PublicKey, transactionId: number): Promise<[PublicKey, number]> {
    const txIdBuffer = Buffer.allocUnsafe(8);
    txIdBuffer.writeBigUInt64LE(BigInt(transactionId));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("withdrawal"), vaultAddress.toBuffer(), txIdBuffer],
      this.programId
    );
  }

  async getKycAttestationPDA(wallet: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync([Buffer.from("kyc_attestation"), wallet.toBuffer()], this.programId);
  }

  async getTokenLimitPDA(wallet: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync([Buffer.from("token_state"), wallet.toBuffer()], this.programId);
  }

  // ========================================================================
  // Read Functions
  // ========================================================================

  async fetchVault(authority: PublicKey, vaultName: string): Promise<Vault | null> {
    try {
      const [vaultAddress] = await this.getVaultPDA(authority, vaultName);
      const accountInfo = await this.connection.getAccountInfo(vaultAddress);

      if (!accountInfo) return null;

      return deserializeVault(accountInfo.data);
    } catch (error) {
      console.error("Error fetching vault:", error);
      return null;
    }
  }

  async fetchMember(vaultAddress: PublicKey, walletAddress: PublicKey): Promise<Member | null> {
    try {
      const [memberAddress] = await this.getMemberPDA(vaultAddress, walletAddress);
      const accountInfo = await this.connection.getAccountInfo(memberAddress);

      if (!accountInfo) return null;

      return deserializeMember(accountInfo.data);
    } catch (error) {
      console.error("Error fetching member:", error);
      return null;
    }
  }

  async fetchWithdrawal(vaultAddress: PublicKey, transactionId: number): Promise<Withdrawal | null> {
    try {
      const [withdrawalAddress] = await this.getWithdrawalPDA(vaultAddress, transactionId);
      const accountInfo = await this.connection.getAccountInfo(withdrawalAddress);

      if (!accountInfo) return null;

      return deserializeWithdrawal(accountInfo.data);
    } catch (error) {
      console.error("Error fetching withdrawal:", error);
      return null;
    }
  }

  async fetchVaultMembers(vaultAddress: PublicKey): Promise<Member[]> {
    try {
      const programAccounts = await this.connection.getProgramAccounts(this.programId, {
        filters: [
          { dataSize: 139 }, // Member account size
          { memcmp: { offset: 8, bytes: vaultAddress.toBase58() } }, // vault field
        ],
      });

      const members: Member[] = [];
      for (const account of programAccounts) {
        const member = deserializeMember(account.account.data);
        if (member) members.push(member);
      }
      return members;
    } catch (error) {
      console.error("Error fetching vault members:", error);
      return [];
    }
  }

  // ========================================================================
  // Write Functions — Build transactions (caller signs + sends)
  // ========================================================================

  async buildInitializeVaultTx(
    authority: PublicKey,
    vaultName: string,
    dailyLimit: number,
    approvalThreshold: number
  ): Promise<Transaction> {
    if (vaultName.length > 32) throw new Error("Vault name too long (max 32 chars)");
    if (approvalThreshold < 1 || approvalThreshold > 10) throw new Error("Approval threshold must be 1-10");

    const [vault] = await this.getVaultPDA(authority, vaultName);
    const [creatorMember] = await this.getMemberPDA(vault, authority);

    // Encode instruction data
    const data = Buffer.alloc(1024);
    let offset = 0;

    // Discriminator
    INSTRUCTION_DISCRIMINATORS.initialize_vault.copy(data, offset);
    offset += 8;

    // name: String (4 bytes length + string data)
    data.writeUInt32LE(vaultName.length, offset);
    offset += 4;
    offset += Buffer.from(vaultName).copy(data, offset);

    // daily_limit: u64
    const dailyLimitBuf = Buffer.allocUnsafe(8);
    dailyLimitBuf.writeBigUInt64LE(BigInt(dailyLimit));
    dailyLimitBuf.copy(data, offset);
    offset += 8;

    // approval_threshold: u8
    data.writeUInt8(approvalThreshold, offset);
    offset += 1;

    const instruction = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: creatorMember, isSigner: false, isWritable: true },
        { pubkey: authority, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: data.slice(0, offset),
    });

    const tx = new Transaction();
    tx.add(instruction);
    return tx;
  }

  async buildAddMemberTx(
    vault: PublicKey,
    caller: PublicKey,
    newWallet: PublicKey,
    role: number
  ): Promise<Transaction> {
    const [callerMember] = await this.getMemberPDA(vault, caller);
    const [newMember] = await this.getMemberPDA(vault, newWallet);

    const data = Buffer.alloc(64);
    let offset = 0;

    // Discriminator
    INSTRUCTION_DISCRIMINATORS.add_member.copy(data, offset);
    offset += 8;

    // wallet: Pubkey (32 bytes)
    newWallet.toBuffer().copy(data, offset);
    offset += 32;

    // role: u8
    data.writeUInt8(role, offset);
    offset += 1;

    const instruction = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: callerMember, isSigner: false, isWritable: false },
        { pubkey: newMember, isSigner: false, isWritable: true },
        { pubkey: caller, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: data.slice(0, offset),
    });

    const tx = new Transaction();
    tx.add(instruction);
    return tx;
  }

  async buildVerifyKycTx(
    vault: PublicKey,
    caller: PublicKey,
    targetWallet: PublicKey,
    kycProvider: string,
    kycReference: string
  ): Promise<Transaction> {
    if (kycProvider.length > 32) throw new Error("KYC provider name too long (max 32 chars)");
    if (kycReference.length > 64) throw new Error("KYC reference too long (max 64 chars)");

    const [callerMember] = await this.getMemberPDA(vault, caller);
    const [targetMember] = await this.getMemberPDA(vault, targetWallet);

    const data = Buffer.alloc(512);
    let offset = 0;

    // Discriminator
    INSTRUCTION_DISCRIMINATORS.verify_kyc.copy(data, offset);
    offset += 8;

    // kyc_provider: String
    data.writeUInt32LE(kycProvider.length, offset);
    offset += 4;
    offset += Buffer.from(kycProvider).copy(data, offset);

    // kyc_reference: String
    data.writeUInt32LE(kycReference.length, offset);
    offset += 4;
    offset += Buffer.from(kycReference).copy(data, offset);

    const instruction = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: vault, isSigner: false, isWritable: false },
        { pubkey: callerMember, isSigner: false, isWritable: false },
        { pubkey: targetMember, isSigner: false, isWritable: true },
        { pubkey: caller, isSigner: true, isWritable: false },
      ],
      data: data.slice(0, offset),
    });

    const tx = new Transaction();
    tx.add(instruction);
    return tx;
  }

  async buildRequestWithdrawalTx(
    vault: PublicKey,
    requester: PublicKey,
    recipient: PublicKey,
    amount: number,
    memo: string
  ): Promise<Transaction> {
    if (memo.length > 256) throw new Error("Memo too long (max 256 chars)");

    const [requesterMember] = await this.getMemberPDA(vault, requester);

    // For withdrawal PDA, we need to know the next transaction_id
    // For now, use 0 as placeholder (in real scenario, fetch vault to get current count)
    const txIdBuffer = Buffer.allocUnsafe(8);
    txIdBuffer.writeBigUInt64LE(BigInt(1)); // Simplified: assume next tx will be 1
    const [withdrawal] = await this.getWithdrawalPDA(vault, 1);

    const data = Buffer.alloc(1024);
    let offset = 0;

    // Discriminator
    INSTRUCTION_DISCRIMINATORS.request_withdrawal.copy(data, offset);
    offset += 8;

    // amount: u64
    const amountBuf = Buffer.allocUnsafe(8);
    amountBuf.writeBigUInt64LE(BigInt(amount));
    amountBuf.copy(data, offset);
    offset += 8;

    // recipient: Pubkey
    recipient.toBuffer().copy(data, offset);
    offset += 32;

    // memo: String
    data.writeUInt32LE(memo.length, offset);
    offset += 4;
    offset += Buffer.from(memo).copy(data, offset);

    const instruction = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: requesterMember, isSigner: false, isWritable: true },
        { pubkey: withdrawal, isSigner: false, isWritable: true },
        { pubkey: requester, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: data.slice(0, offset),
    });

    const tx = new Transaction();
    tx.add(instruction);
    return tx;
  }

  async buildApproveWithdrawalTx(
    vault: PublicKey,
    caller: PublicKey,
    withdrawal: PublicKey
  ): Promise<Transaction> {
    const [callerMember] = await this.getMemberPDA(vault, caller);

    const data = Buffer.alloc(8);
    INSTRUCTION_DISCRIMINATORS.approve_withdrawal.copy(data, 0);

    const instruction = new TransactionInstruction({
      programId: this.programId,
      keys: [
        { pubkey: vault, isSigner: false, isWritable: false },
        { pubkey: callerMember, isSigner: false, isWritable: false },
        { pubkey: withdrawal, isSigner: false, isWritable: true },
        { pubkey: caller, isSigner: true, isWritable: false },
      ],
      data,
    });

    const tx = new Transaction();
    tx.add(instruction);
    return tx;
  }

  // ========================================================================
  // Utility
  // ========================================================================

  getConnection(): Connection {
    return this.connection;
  }

  getProgramId(): PublicKey {
    return this.programId;
  }
}

// Export singleton instance
export const bastionClient = new BastionProgramClient();
