"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, ArrowDown, Zap, Info, RefreshCw, TrendingUp } from "lucide-react"
import { useJupiterSwap } from "@/hooks/use-jupiter-swap"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

const TOKEN_MINTS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
}

export function SwapInterface() {
  const [fromAmount, setFromAmount] = useState("")
  const [fromToken, setFromToken] = useState("SOL")
  const [toToken, setToToken] = useState("USDC")
  const [slippage, setSlippage] = useState("0.5")
  const { quote, isLoading, getSwapQuote, executeSwap, refreshQuote } = useJupiterSwap()
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey && connected) {
        try {
          const balance = await connection.getBalance(publicKey)
          setBalance(balance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("[v0] Failed to fetch balance:", error)
        }
      }
    }
    fetchBalance()
  }, [publicKey, connected, connection])

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount
    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount("")
  }

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value)

    if (value && Number.parseFloat(value) > 0) {
      await getSwapQuote(
        TOKEN_MINTS[fromToken as keyof typeof TOKEN_MINTS],
        TOKEN_MINTS[toToken as keyof typeof TOKEN_MINTS],
        Number.parseFloat(value),
        Number.parseFloat(slippage) * 100,
      )
    }
  }

  const handleSwap = async () => {
    if (!quote || !connected) return

    try {
      const signature = await executeSwap(quote)
      console.log("[v0] Swap completed:", signature)

      // Reset form
      setFromAmount("")
    } catch (error) {
      console.error("[v0] Swap failed:", error)
    }
  }

  const handleMaxClick = () => {
    if (fromToken === "SOL") {
      // Leave some SOL for transaction fees
      const maxAmount = Math.max(0, balance - 0.01)
      handleFromAmountChange(maxAmount.toString())
    }
  }

  const isFormValid = fromAmount && quote && Number.parseFloat(fromAmount) > 0 && connected

  const formatAmount = (amount: string, decimals = 6) => {
    const num = Number.parseFloat(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-primary" />
            Token Swap
          </CardTitle>
          <CardDescription>Swap between SOL and USDC using Jupiter aggregator</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="text-lg pr-20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="font-medium">
                  {fromToken}
                </Badge>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Balance: {balance.toFixed(4)} {fromToken}
              </span>
              <button onClick={handleMaxClick} className="text-primary hover:underline">
                Max
              </button>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwapTokens}
              className="rounded-full w-10 h-10 p-0 bg-transparent"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label>To (Estimated)</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="0.00"
                value={quote ? formatAmount(quote.outAmount, toToken === "SOL" ? 9 : 6) : ""}
                readOnly
                className="text-lg pr-20 bg-muted/50"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="font-medium">
                  {toToken}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          {quote && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exchange Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        1 {fromToken} ≈{" "}
                        {(Number.parseFloat(quote.outAmount) / Number.parseFloat(quote.inAmount)).toFixed(4)} {toToken}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={refreshQuote}>
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price Impact</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-sm font-medium text-green-500">{quote.priceImpactPct.toFixed(2)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Slippage Tolerance</span>
                    <Badge variant="outline">{slippage}%</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Route</span>
                    <span className="text-sm font-medium">{quote.marketInfos[0]?.label || "Jupiter"}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network Fee</span>
                    <span className="text-sm font-medium">~0.00025 SOL</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Swap Button */}
          <Button onClick={handleSwap} disabled={!isFormValid || isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                {quote ? "Swapping..." : "Getting Quote..."}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Swap Tokens
              </>
            )}
          </Button>

          {/* Info */}
          <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <Info className="w-4 h-4 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Powered by Jupiter</p>
              <p className="text-xs text-muted-foreground">
                Best rates across all Solana DEXs. After swapping, you can immediately create a time lock.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
