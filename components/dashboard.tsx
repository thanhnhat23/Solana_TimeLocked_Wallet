"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import { CreateLock } from "@/components/create-lock"
import { LockHistory } from "@/components/lock-history"
import { SwapInterface } from "@/components/swap-interface"
import { NetworkStatus } from "@/components/network-status"
import { useWallet } from "@/components/wallet-provider"
import { useLockHistory } from "@/hooks/use-lock-history"
import { Clock, Lock, Wallet, ArrowUpDown, History, ExternalLink, Download } from "lucide-react"

export function Dashboard() {
  const { connected, publicKey } = useWallet()
  const { locks, fetchLockHistory, withdrawFromLock } = useLockHistory()
  const [activeTab, setActiveTab] = useState("overview")

  const totalLockedValue = locks.reduce((sum, lock) => {
    if (lock.status === "locked" || lock.status === "unlocking") {
      return sum + Number.parseFloat(lock.amount)
    }
    return sum
  }, 0)

  const unlockedFunds = locks.reduce((sum, lock) => {
    if (lock.status === "unlocked") {
      return sum + Number.parseFloat(lock.amount)
    }
    return sum
  }, 0)

  const activeLocks = locks.filter((lock) => lock.status === "locked" || lock.status === "unlocking").length

  const recentLocks = locks.slice(0, 3)

  const handleWithdrawAll = async () => {
    const unlockedLocks = locks.filter((lock) => lock.status === "unlocked")
    for (const lock of unlockedLocks) {
      await withdrawFromLock(lock.id)
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <WalletConnect />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground leading-tight">TimeVault</h1>
              <span className="text-xs text-muted-foreground/60 leading-tight">by NekoNora</span>
            </div>
            <NetworkStatus />
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Lock
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Locked Value */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Locked Value</CardTitle>
                  <Lock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {totalLockedValue > 0 ? `${totalLockedValue.toFixed(2)} SOL` : "0 SOL"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalLockedValue > 0 ? `≈ $${(totalLockedValue * 150).toFixed(2)} USD` : "No locks created yet"}
                  </p>
                </CardContent>
              </Card>

              {/* Active Locks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Locks</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{activeLocks}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeLocks > 0 ? "Currently locked funds" : "Create your first lock"}
                  </p>
                </CardContent>
              </Card>

              {/* Portfolio Growth */}
              <Card
                className={
                  unlockedFunds > 0 ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20" : ""
                }
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unlocked Funds</CardTitle>
                  <Download className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {unlockedFunds > 0 ? `${unlockedFunds.toFixed(2)} SOL` : "0 SOL"}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {unlockedFunds > 0 ? "Ready to withdraw" : "No unlocked funds"}
                    </p>
                    {unlockedFunds > 0 && (
                      <Button
                        size="sm"
                        onClick={handleWithdrawAll}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Locks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Time Locks</CardTitle>
                <CardDescription>Your most recent locked funds and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLocks.length > 0 ? (
                  <div className="space-y-4">
                    {recentLocks.map((lock) => (
                      <div key={lock.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {lock.amount} {lock.token}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Unlocks: {lock.unlockDate.toLocaleDateString()} at {lock.unlockDate.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              lock.status === "locked"
                                ? "secondary"
                                : lock.status === "unlocked"
                                  ? "default"
                                  : lock.status === "withdrawn"
                                    ? "outline"
                                    : "secondary"
                            }
                          >
                            {lock.status}
                          </Badge>
                          {lock.status === "unlocked" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => withdrawFromLock(lock.id)}
                              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-black"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Withdraw
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(`https://explorer.solana.com/tx/${lock.txHash}?cluster=devnet`, "_blank")
                            }
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No locks created yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first time lock to start securing your funds
                    </p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Create Time Lock
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <CreateLock />
          </TabsContent>

          <TabsContent value="swap">
            <SwapInterface />
          </TabsContent>

          <TabsContent value="history">
            <LockHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
