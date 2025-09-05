"use client"

import { useState, useEffect, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useWallet as useWalletProvider } from "@/components/wallet-provider"

export interface LockRecord {
  id: string
  amount: string
  token: "SOL" | "USDC"
  lockDate: Date
  unlockDate: Date
  status: "locked" | "unlocking" | "unlocked" | "withdrawn"
  recipient?: string
  txHash: string
  pdaAddress: string
  withdrawnAt?: number
}

export function useLockHistory() {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const { addDemoBalance } = useWalletProvider()
  const [locks, setLocks] = useState<LockRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchLockHistory = useCallback(async () => {
    if (!publicKey || !connected) return

    setIsLoading(true)
    try {
      console.log("[v0] Fetching lock history for:", publicKey.toString())

      const storageKey = `demo_timelocks_${publicKey.toString()}`
      const storedLocks = JSON.parse(localStorage.getItem(storageKey) || "[]")
      const currentTime = Math.floor(Date.now() / 1000)
      let hasUpdates = false

      const convertedLocks: LockRecord[] = storedLocks
        .filter((lock: any) => lock.creator === publicKey.toString())
        .map((lock: any) => {
          let status: "locked" | "unlocking" | "unlocked" | "withdrawn" = lock.status

          if (lock.status === "locked" && currentTime >= lock.unlockTimestamp) {
            status = "unlocked"
            lock.status = "unlocked" // Update the original object
            hasUpdates = true
            console.log("[v0] Lock", lock.id, "has expired and is now unlocked")
          }

          return {
            id: lock.id,
            amount: lock.amount.toString(),
            token: "SOL" as const,
            lockDate: new Date(lock.createdAt),
            unlockDate: new Date(lock.unlockTimestamp * 1000),
            status,
            recipient: lock.recipient,
            txHash: lock.id,
            pdaAddress: `pda_${lock.id.slice(-8)}`,
            withdrawnAt: lock.withdrawnAt,
          }
        })

      if (hasUpdates) {
        localStorage.setItem(storageKey, JSON.stringify(storedLocks))
        console.log("[v0] Updated lock statuses in localStorage")
      }

      console.log("[v0] Found", convertedLocks.length, "locks for user")
      setLocks(convertedLocks)
    } catch (error) {
      console.error("[v0] Failed to fetch lock history:", error)
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, connected])

  const withdrawFromLock = async (lockId: string) => {
    if (!publicKey) return

    const lock = locks.find((l) => l.id === lockId)
    if (!lock || lock.status !== "unlocked") return

    try {
      console.log("[v0] Withdrawing from lock:", lockId)

      const storageKey = `demo_timelocks_${publicKey.toString()}`
      const existingLocks = JSON.parse(localStorage.getItem(storageKey) || "[]")

      console.log("[v0] Before withdrawal - total locks:", existingLocks.length)
      console.log(
        "[v0] Locks before withdrawal:",
        existingLocks.map((l: any) => ({ id: l.id, status: l.status })),
      )

      const lockIndex = existingLocks.findIndex((l: any) => l.id === lockId)

      if (lockIndex !== -1) {
        const lockAmount = existingLocks[lockIndex].amount

        existingLocks[lockIndex].status = "withdrawn"
        existingLocks[lockIndex].withdrawnAt = Date.now()

        console.log("[v0] Updated lock status to withdrawn:", existingLocks[lockIndex])

        localStorage.setItem(storageKey, JSON.stringify(existingLocks))

        const verifyLocks = JSON.parse(localStorage.getItem(storageKey) || "[]")
        console.log("[v0] After withdrawal - total locks:", verifyLocks.length)
        console.log(
          "[v0] Locks after withdrawal:",
          verifyLocks.map((l: any) => ({ id: l.id, status: l.status })),
        )

        addDemoBalance(lockAmount)
      }

      setLocks((prev) => prev.map((l) => (l.id === lockId ? { ...l, status: "withdrawn" as const } : l)))

      return "mock_withdraw_signature"
    } catch (error) {
      console.error("[v0] Failed to withdraw from lock:", error)
      throw error
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchLockHistory()
    }
  }, [connected, publicKey, fetchLockHistory])

  const handleStorageChange = useCallback(
    (e: StorageEvent) => {
      if (connected && publicKey && e.key?.includes(`demo_timelocks_${publicKey.toString()}`)) {
        fetchLockHistory()
      }
    },
    [connected, publicKey, fetchLockHistory],
  )

  const handleCustomStorageChange = useCallback(() => {
    if (connected && publicKey) {
      fetchLockHistory()
    }
  }, [connected, publicKey, fetchLockHistory])

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("lockCreated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("lockCreated", handleCustomStorageChange)
    }
  }, [handleStorageChange, handleCustomStorageChange])

  useEffect(() => {
    if (!connected || !publicKey) return

    const checkExpiredLocks = () => {
      fetchLockHistory()
    }

    // Check immediately
    checkExpiredLocks()

    // Set up interval to check every minute
    const interval = setInterval(checkExpiredLocks, 60000)

    return () => clearInterval(interval)
  }, [connected, publicKey, fetchLockHistory])

  return {
    locks,
    isLoading,
    fetchLockHistory,
    withdrawFromLock,
  }
}
