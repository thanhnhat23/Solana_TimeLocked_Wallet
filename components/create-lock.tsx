"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Lock, AlertCircle, Info, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { useSolanaProgram } from "@/components/solana-program"
import { useWallet } from "@/components/wallet-provider"

export function CreateLock() {
  const [amount, setAmount] = useState("")
  const [token, setToken] = useState("SOL")
  const [unlockDate, setUnlockDate] = useState<Date>()
  const [unlockTime, setUnlockTime] = useState("12:00")
  const [recipient, setRecipient] = useState("")
  const [success, setSuccess] = useState(false)
  const { createTimeLock, isLoading } = useSolanaProgram()
  const { connected, balance } = useWallet()

  const handleCreateLock = async () => {
    if (!amount || !unlockDate || !connected) return

    try {
      const [hours, minutes] = unlockTime.split(":").map(Number)
      const combinedDateTime = new Date(unlockDate)
      combinedDateTime.setHours(hours, minutes, 0, 0)

      const unlockTimestamp = Math.floor(combinedDateTime.getTime() / 1000)
      const signature = await createTimeLock(Number.parseFloat(amount), unlockTimestamp, recipient || undefined)

      console.log("[v0] Lock created successfully:", signature)
      setSuccess(true)

      setTimeout(() => {
        setAmount("")
        setUnlockDate(undefined)
        setUnlockTime("12:00")
        setRecipient("")
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("[v0] Failed to create lock:", error)
    }
  }

  const isFormValid = amount && unlockDate && Number.parseFloat(amount) > 0 && connected
  const hasInsufficientBalance = amount && Number.parseFloat(amount) > balance

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-500">Lock Created Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Your {amount} {token} has been locked until {unlockDate && format(unlockDate, "PPP")} at {unlockTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Create Time Lock
          </CardTitle>
          <CardDescription>
            Lock your SOL or USDC for a specified period. Funds will be transferred from your wallet to a secure smart
            contract until the unlock date.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available: {balance.toFixed(4)} SOL</span>
                {hasInsufficientBalance && <span className="text-destructive">Insufficient balance</span>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Unlock Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {unlockDate ? format(unlockDate, "PPP") : "Select unlock date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={unlockDate}
                    onSelect={setUnlockDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unlock-time">Unlock Time</Label>
              <Input
                id="unlock-time"
                type="time"
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
                className="bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient (Optional)</Label>
            <Input
              id="recipient"
              placeholder="Recipient wallet address (leave empty for self)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              If specified, only this address can withdraw the funds after unlock
            </p>
          </div>

          {amount && unlockDate && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="font-medium">Lock Summary</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">
                        {amount} {token}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unlock Date:</span>
                      <span className="font-medium">
                        {format(unlockDate, "PPP")} at {unlockTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lock Duration:</span>
                      <Badge variant="secondary">
                        {(() => {
                          const [hours, minutes] = unlockTime.split(":").map(Number)
                          const combinedDateTime = new Date(unlockDate)
                          combinedDateTime.setHours(hours, minutes, 0, 0)
                          const durationHours = Math.ceil(
                            (combinedDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60),
                          )
                          if (durationHours < 24) {
                            return `${durationHours} hours`
                          } else {
                            return `${Math.ceil(durationHours / 24)} days`
                          }
                        })()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Important Warning</p>
              <p className="text-xs text-muted-foreground">
                Once locked, your SOL will be transferred to a smart contract and cannot be accessed until the unlock
                date. The funds will be deducted from your wallet balance immediately and returned when you withdraw
                after the unlock period.
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreateLock}
            disabled={!isFormValid || isLoading || hasInsufficientBalance}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Creating Lock...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Create Time Lock
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
