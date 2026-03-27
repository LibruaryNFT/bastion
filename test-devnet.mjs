/**
 * End-to-end devnet test for Bastion program
 * Tests: initialize_vault → add_member → verify_kyc
 *
 * Run: node test-devnet.mjs
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { readFileSync } from "fs";
import { createHash } from "crypto";

const PROGRAM_ID = new PublicKey("3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Load wallet keypair
const walletPath = process.env.HOME + "/.config/solana/id.json";
const walletData = JSON.parse(readFileSync(walletPath, "utf-8"));
const wallet = Keypair.fromSecretKey(new Uint8Array(walletData));

console.log("Wallet:", wallet.publicKey.toBase58());
console.log("Program:", PROGRAM_ID.toBase58());

// Compute Anchor instruction discriminator
function getDiscriminator(name) {
  const hash = createHash("sha256").update(`global:${name}`).digest();
  return hash.slice(0, 8);
}

// Derive PDA
function getVaultPDA(authority, vaultName) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), authority.toBuffer(), Buffer.from(vaultName)],
    PROGRAM_ID
  );
}

function getMemberPDA(vault, wallet) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("member"), vault.toBuffer(), wallet.toBuffer()],
    PROGRAM_ID
  );
}

// ========================================================================
// TEST 1: Initialize Vault
// ========================================================================
async function testInitializeVault() {
  console.log("\n=== TEST 1: Initialize Vault ===");

  const vaultName = "TestVault" + Date.now().toString().slice(-4);
  const [vaultPDA, bump] = getVaultPDA(wallet.publicKey, vaultName);

  console.log("Vault PDA:", vaultPDA.toBase58());
  console.log("Vault name:", vaultName);

  // Check if vault already exists
  const existing = await connection.getAccountInfo(vaultPDA);
  if (existing) {
    console.log("Vault already exists, skipping creation");
    return { vaultPDA, vaultName };
  }

  // Derive creator_member PDA (vault creates admin member automatically)
  const [creatorMemberPDA] = getMemberPDA(vaultPDA, wallet.publicKey);
  console.log("Creator Member PDA:", creatorMemberPDA.toBase58());

  // Build instruction data:
  // discriminator (8) + name_len (4) + name + daily_limit (8) + approval_threshold (1)
  // Anchor serializes String as: 4-byte little-endian length + UTF-8 bytes
  const disc = getDiscriminator("initialize_vault");
  const nameBytes = Buffer.from(vaultName, "utf-8");
  const nameLenBuf = Buffer.alloc(4);
  nameLenBuf.writeUInt32LE(nameBytes.length);

  const dailyLimit = Buffer.alloc(8);
  dailyLimit.writeBigUInt64LE(BigInt(100_000_000_000)); // 100K USDC (6 decimals)

  const approvalThreshold = Buffer.from([2]); // 2-of-N

  const data = Buffer.concat([disc, nameLenBuf, nameBytes, dailyLimit, approvalThreshold]);

  // Account order must match Rust struct: vault, creator_member, authority, system_program
  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: vaultPDA, isSigner: false, isWritable: true },
      { pubkey: creatorMemberPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  try {
    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
    console.log("SUCCESS! Tx:", sig);
    console.log("Explorer: https://explorer.solana.com/tx/" + sig + "?cluster=devnet");
    return { vaultPDA, vaultName };
  } catch (err) {
    console.log("FAILED:", err.message?.slice(0, 200));
    // Try to parse the program error
    if (err.logs) {
      const errorLog = err.logs.find(l => l.includes("Error") || l.includes("error"));
      if (errorLog) console.log("Program log:", errorLog);
    }
    return { vaultPDA, vaultName, error: true };
  }
}

// ========================================================================
// TEST 2: Read Vault Data
// ========================================================================
async function testReadVault(vaultPDA) {
  console.log("\n=== TEST 2: Read Vault Account ===");

  const info = await connection.getAccountInfo(vaultPDA);
  if (!info) {
    console.log("Vault account not found (creation may have failed)");
    return false;
  }

  console.log("Account exists!");
  console.log("Data length:", info.data.length, "bytes");
  console.log("Owner:", info.owner.toBase58());
  console.log("Lamports:", info.lamports);

  // Parse the account data (skip 8-byte discriminator)
  const data = info.data.slice(8);
  // authority (32 bytes)
  const authority = new PublicKey(data.slice(0, 32));
  console.log("Authority:", authority.toBase58());

  // name (4-byte len + string)
  const nameLen = data.readUInt32LE(32);
  const name = data.slice(36, 36 + nameLen).toString("utf-8");
  console.log("Name:", name);

  return true;
}

// ========================================================================
// TEST 3: Add Member
// ========================================================================
async function testAddMember(vaultPDA) {
  console.log("\n=== TEST 3: Add Member (self as Admin) ===");

  const [memberPDA] = getMemberPDA(vaultPDA, wallet.publicKey);
  console.log("Member PDA:", memberPDA.toBase58());

  // Check if member already exists
  const existing = await connection.getAccountInfo(memberPDA);
  if (existing) {
    console.log("Member already exists, skipping");
    return memberPDA;
  }

  // discriminator + member_wallet (32) + role (1) + daily_limit (8)
  const disc = getDiscriminator("add_member");
  const memberWallet = wallet.publicKey.toBuffer();
  const role = Buffer.from([0]); // 0 = Admin
  const dailyLimit = Buffer.alloc(8);
  dailyLimit.writeBigUInt64LE(BigInt(100_000_000_000)); // 100K

  const data = Buffer.concat([disc, memberWallet, role, dailyLimit]);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: vaultPDA, isSigner: false, isWritable: true },
      { pubkey: memberPDA, isSigner: false, isWritable: true },
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  try {
    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
    console.log("SUCCESS! Tx:", sig);
    console.log("Explorer: https://explorer.solana.com/tx/" + sig + "?cluster=devnet");
    return memberPDA;
  } catch (err) {
    console.log("FAILED:", err.message?.slice(0, 200));
    if (err.logs) {
      err.logs.filter(l => l.includes("Error") || l.includes("error") || l.includes("Program log")).forEach(l => console.log("  ", l));
    }
    return null;
  }
}

// ========================================================================
// RUN ALL TESTS
// ========================================================================
async function main() {
  console.log("=== Bastion Devnet E2E Test ===");
  console.log("Time:", new Date().toISOString());

  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Balance:", balance / 1e9, "SOL");

  if (balance < 0.1 * 1e9) {
    console.log("ERROR: Insufficient balance for testing");
    process.exit(1);
  }

  // Test 1: Create vault
  const { vaultPDA, vaultName, error } = await testInitializeVault();

  // Test 2: Read vault
  const vaultExists = await testReadVault(vaultPDA);

  // Test 3: Add member (only if vault was created)
  if (vaultExists) {
    await testAddMember(vaultPDA);
  }

  console.log("\n=== Test Summary ===");
  console.log("Vault PDA:", vaultPDA.toBase58());
  console.log("Vault created:", !error);
  console.log("Vault readable:", vaultExists);
}

main().catch(console.error);
