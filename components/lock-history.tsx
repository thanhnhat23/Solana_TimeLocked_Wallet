"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Lock, Unlock, Search, Filter, ExternalLink, Calendar, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { useLockHistory } from "@/hooks/use-lock-history"

export function LockHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tokenFilter, setTokenFilter] = useState("all")
  const { locks, isLoading, fetchLockHistory, withdrawFromLock } = useLockHistory()

  const filteredLocks = locks.filter((lock) => {
    const matchesSearch =
      lock.amount.includes(searchTerm) || lock.txHash.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lock.status === statusFilter
    const matchesToken = tokenFilter === "all" || lock.token === tokenFilter

    return matchesSearch && matchesStatus && matchesToken
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "locked":
        return "secondary"
      case "unlocking":
        return "default"
      case "unlocked":
        return "outline"
      case "withdrawn":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "locked":
        return <Lock className="w-3 h-3" />
      case "unlocking":
        return <Clock className="w-3 h-3" />
      case "unlocked":
        return <Unlock className="w-3 h-3" />
      case "withdrawn":
        return <Unlock className="w-3 h-3" />
      default:
        return <Lock className="w-3 h-3" />
    }
  }

  const handleWithdraw = async (lockId: string) => {
    try {
      await withdrawFromLock(lockId)
    } catch (error) {
      console.error("[v0] Withdrawal failed:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Lock History
              </CardTitle>
              <CardDescription>View and manage all your time-locked funds</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLockHistory} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by amount or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="unlocking">Unlocking</SelectItem>
                <SelectItem value="unlocked">Unlocked</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tokenFilter} onValueChange={setTokenFilter}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tokens</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lock Records */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading lock history...</p>
              </div>
            ) : filteredLocks.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No locks found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || tokenFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first time lock to get started"}
                </p>
              </div>
            ) : (
              filteredLocks.map((lock) => (
                <Card key={lock.id} className="border border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {getStatusIcon(lock.status)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">
                              {lock.amount} {lock.token}
                            </span>
                            <Badge variant={getStatusColor(lock.status)}>{lock.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Locked: {format(lock.lockDate, "MMM dd, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Unlocks: {format(lock.unlockDate, "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(`https://explorer.solana.com/tx/${lock.txHash}?cluster=devnet`, "_blank")
                          }
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Tx
                        </Button>

                        {lock.status === "unlocked" && (
                          <Button onClick={() => handleWithdraw(lock.id)} size="sm">
                            <Unlock className="w-3 h-3 mr-1" />
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Transaction Hash and PDA */}
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Transaction Hash:</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {lock.txHash.slice(0, 8)}...{lock.txHash.slice(-8)}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Lock Address (PDA):</span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {lock.pdaAddress.slice(0, 8)}...{lock.pdaAddress.slice(-8)}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
