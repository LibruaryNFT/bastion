import { Connection, PublicKey } from '@solana/web3.js';

export const DEVNET_RPC = 'https://api.devnet.solana.com';
export const PROGRAM_ID = new PublicKey('3rsfme5BC3htuFJwFohPgNiDDmSo43gqZgQNvtKz3HVv');
export const connection = new Connection(DEVNET_RPC, 'confirmed');

export interface ProgramStatus {
  live: boolean;
  slot: number;
  balance: number;
}

export function explorerUrl(address: string, type: 'address' | 'tx' = 'address'): string {
  return `https://explorer.solana.com/${type}/${address}?cluster=devnet`;
}

export async function getProgramStatus(): Promise<ProgramStatus> {
  try {
    const info = await connection.getAccountInfo(PROGRAM_ID);
    const slot = await connection.getSlot();
    const balance = info ? info.lamports / 1e9 : 0;
    return { live: !!info, slot, balance };
  } catch (error) {
    return { live: false, slot: 0, balance: 0 };
  }
}

export async function getWalletBalance(publicKey: PublicKey | null): Promise<number> {
  if (!publicKey) return 0;
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9;
  } catch (error) {
    return 0;
  }
}
