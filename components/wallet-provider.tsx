"use client"

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet as useSolanaWallet,
  useConnection,
} from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
// import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js"

import "@solana/wallet-adapter-react-ui/styles.css"

type WalletContextType = {
  connected: boolean
  publicKey: string | null
  balance: number
  connect: () => void
  disconnect: () => void
  connecting: boolean
  deductDemoBalance: (amount: number) => void
  addDemoBalance: (amount: number) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

function WalletContextProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, connecting, connect, disconnect } = useSolanaWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(0)
  const [demoBalance, setDemoBalance] = useState<number | null>(null)

  useEffect(() => {
    if (publicKey && connected) {
      const fetchBalance = async () => {
        try {
          const realBalance = await connection.getBalance(publicKey)
          const balanceInSol = realBalance / LAMPORTS_PER_SOL
          setBalance(balanceInSol)

          const balanceKey = `${publicKey.toString()}`
          const savedDemoBalance = localStorage.getItem(balanceKey)
          if (savedDemoBalance) {
            const savedBalance = Number.parseFloat(savedDemoBalance)
            setDemoBalance(savedBalance)
            console.log("[v0] Restored demo balance:", savedBalance)
          } else {
            setDemoBalance(balanceInSol)
            localStorage.setItem(balanceKey, balanceInSol.toString())
            console.log("[v0] Initialized demo balance:", balanceInSol)
          }
        } catch (error) {
          console.error("Error fetching balance:", error)
          setBalance(0)
          setDemoBalance(0)
        }
      }
      fetchBalance()
    } else {
      setBalance(0)
      setDemoBalance(null)
    }
  }, [publicKey, connected, connection])

  const deductDemoBalance = (amount: number) => {
    if (demoBalance !== null && publicKey) {
      const newBalance = Math.max(0, demoBalance - amount)
      setDemoBalance(newBalance)
      const balanceKey = `${publicKey.toString()}`
      localStorage.setItem(balanceKey, newBalance.toString())
      console.log("[v0] Demo balance deducted:", amount, "New balance:", newBalance)
    }
  }

  const addDemoBalance = (amount: number) => {
    if (demoBalance !== null && publicKey) {
      const newBalance = demoBalance + amount
      setDemoBalance(newBalance)
      const balanceKey = `${publicKey.toString()}`
      localStorage.setItem(balanceKey, newBalance.toString())
      console.log("[v0] Demo balance added:", amount, "New balance:", newBalance)
    }
  }

  const value: WalletContextType = {
    connected,
    publicKey: publicKey?.toString() || null,
    balance: demoBalance !== null ? demoBalance : balance,
    connect,
    disconnect,
    connecting,
    deductDemoBalance,
    addDemoBalance,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
