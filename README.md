# Solana Time-Locked Wallet

A modern, secure time-locked wallet built on Solana that allows users to lock SOL or USDC for specified periods. Features a sophisticated DeFi interface with swap functionality and comprehensive lock management.

## 🚀 Features

### Core Functionality
- **Time-Locked Wallets**: Lock SOL or USDC until a specified unlock timestamp
- **On-Chain Enforcement**: Funds are secured by Solana smart contracts (PDA accounts)
- **Flexible Recipients**: Lock funds for yourself or designate another wallet
- **Withdrawal System**: Automatic unlock and withdrawal after the specified time

### Modern Interface
- **Multi-Wallet Support**: Compatible with Phantom, Backpack, Solflare, and other Solana wallets
- **Real-Time Balance**: Live SOL balance fetching from the blockchain
- **Token Swapping**: Integrated Jupiter aggregator for SOL ⟷ USDC swaps
- **Lock History**: Complete transaction history with Solscan integration
- **Responsive Design**: Modern dark theme optimized for desktop and mobile

### Advanced Features
- **Jupiter Integration**: Best swap rates across all Solana DEXs
- **Transaction Tracking**: View all locks with status, dates, and blockchain links
- **PDA Management**: Secure Program Derived Address handling
- **Real-Time Quotes**: Live pricing and slippage protection for swaps

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling with design tokens
- **shadcn/ui** - High-quality component library
- **Lucide React** - Beautiful icons

### Blockchain
- **Solana Web3.js** - Blockchain interaction
- **Wallet Adapter** - Multi-wallet connection support
- **Anchor Framework** - Solana program development
- **Jupiter API** - DEX aggregation for token swaps

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Rust and Solana CLI (for smart contract development)
- Anchor CLI (for program deployment)

### Frontend Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/thanhnhat23/Solana_TimeLocked_Wallet.git
   cd Solana_TimeLocked_Wallet
   npm install

2. **Environment Setup**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
   ```

3. **Run Development Server**
   ```bash
   npm run dev

4. **Open Application**
   Navigate to `http://localhost:3000`

### Smart Contract Setup

1. **Install Anchor**
   ```bash
   npm install -g @coral-xyz/anchor-cli
   anchor --version

2. **Build Program**
   ```bash
   cd anchor-program
   anchor build

3. **Deploy to Devnet**
   ```bash
   anchor deploy --provider.cluster devnet

4. **Update Program ID**
   Update the program ID in `lib/constants.ts` with your deployed program address.

## 🎯 Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" button
- Select your preferred Solana wallet (Phantom, Backpack, etc.)
- Approve the connection request

### 2. Create Time Lock
- Navigate to the "Lock" tab
- Enter the amount of SOL or USDC to lock
- Select the unlock date (must be in the future)
- Optionally specify a recipient wallet address
- Review the lock summary and confirm the transaction

### 3. Swap Tokens (Optional)
- Use the "Swap" tab to exchange SOL ⟷ USDC
- Enter the amount to swap
- Review the quote from Jupiter aggregator
- Execute the swap before creating locks

### 4. Manage Locks
- View all your locks in the "History" tab
- Filter by status, token type, or search by transaction hash
- Withdraw unlocked funds when the time period expires
- View transaction details on Solscan

## 🔧 Smart Contract Details

### Program Instructions

#### `initialize_lock`
Creates a new time-locked account with specified parameters.

**Parameters:**
- `amount: u64` - Amount to lock (in lamports for SOL, smallest unit for tokens)
- `unlock_timestamp: i64` - Unix timestamp when funds can be withdrawn
- `recipient: Option<Pubkey>` - Optional recipient address (defaults to creator)

#### `withdraw`
Withdraws funds from an unlocked time-lock account.

**Requirements:**
- Current timestamp must be >= unlock_timestamp
- Caller must be the designated recipient
- Account must have sufficient balance

### Account Structure

```rust
#[account]
pub struct TimeLock {
    pub creator: Pubkey,           // Who created the lock
    pub recipient: Pubkey,         // Who can withdraw (may be same as creator)
    pub amount: u64,               // Locked amount
    pub unlock_timestamp: i64,     // When it unlocks
    pub is_withdrawn: bool,        // Withdrawal status
    pub bump: u8,                  // PDA bump seed
}

