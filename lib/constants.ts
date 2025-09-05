import { PublicKey } from "@solana/web3.js"

// Program IDs
export const TIMELOCK_PROGRAM_ID = new PublicKey("11111111111111111111111111111112")

// Token Mint Addresses
export const TOKEN_MINTS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Mainnet USDC
  USDC_DEVNET: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
} as const

// Network Configuration
export const NETWORK_CONFIG = {
  DEVNET: {
    name: "devnet",
    rpcUrl: "https://api.devnet.solana.com",
    explorerUrl: "https://solscan.io",
  },
  MAINNET: {
    name: "mainnet-beta",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    explorerUrl: "https://solscan.io",
  },
} as const

// Jupiter API Configuration
export const JUPITER_CONFIG = {
  QUOTE_API: "https://quote-api.jup.ag/v6/quote",
  SWAP_API: "https://quote-api.jup.ag/v6/swap",
  DEFAULT_SLIPPAGE_BPS: 50, // 0.5%
} as const
