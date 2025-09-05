"use client"

import { useState } from "react"
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, LogOut, Copy, Check } from "lucide-react"

export function WalletConnect() {
  const { disconnect: solanaDisconnect, wallet } = useSolanaWallet()
  const { publicKey, balance, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [copied, setCopied] = useState(false)

  const getWalletIcon = () => {
    if (!wallet?.adapter?.name) return <Wallet className="w-4 h-4 text-muted-foreground" />

    const walletName = wallet.adapter.name.toLowerCase()
    if (walletName.includes("phantom")) {
      return (
        <img
          src="/phantom-icon.jpg"
          alt="Phantom"
          className="w-4 h-4"
          onError={(e) => {
            e.currentTarget.style.display = "none"
            e.currentTarget.nextElementSibling?.classList.remove("hidden")
          }}
        />
      )
    }
    if (walletName.includes("solflare")) {
      return (
        <img
          src="/solflare-icon.jpg"
          alt="Solflare"
          className="w-4 h-4"
          onError={(e) => {
            e.currentTarget.style.display = "none"
            e.currentTarget.nextElementSibling?.classList.remove("hidden")
          }}
        />
      )
    }
    return <Wallet className="w-4 h-4 text-muted-foreground" />
  }

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnect()
    solanaDisconnect()
  }

  if (!connected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your Solana wallet to start using TimeVault for secure time-locked funds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setVisible(true)} className="w-full" size="lg">
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Supports Phantom, Solflare and other Solana wallets</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">{balance.toFixed(4)} SOL</span>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
        {getWalletIcon()}
        <Wallet className="w-4 h-4 text-muted-foreground hidden" />
        <button
          onClick={copyAddress}
          className="flex items-center gap-2 text-sm font-mono hover:text-primary transition-colors"
        >
          {publicKey && formatAddress(publicKey)}
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      <Button variant="outline" size="sm" onClick={handleDisconnect}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  )
}
