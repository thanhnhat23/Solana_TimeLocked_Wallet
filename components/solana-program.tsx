"use client"

import { useConnection, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react"
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useState } from "react"
import { useWallet } from "@/components/wallet-provider"

const TIMELOCK_PROGRAM_ID = new PublicKey("11111111111111111111111111111112")

export function useSolanaProgram() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useSolanaWallet()
  const { deductDemoBalance, addDemoBalance } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const createTimeLock = async (amount: number, unlockTimestamp: number, recipient?: string) => {
    if (!publicKey) throw new Error("Wallet not connected")

    const balance = await connection.getBalance(publicKey)
    const requiredLamports = amount * LAMPORTS_PER_SOL
    const estimatedFee = 5000 // 0.000005 SOL estimated transaction fee

    if (balance < requiredLamports + estimatedFee) {
      throw new Error(
        `Insufficient balance. Required: ${(requiredLamports + estimatedFee) / LAMPORTS_PER_SOL} SOL, Available: ${balance / LAMPORTS_PER_SOL} SOL`,
      )
    }

    setIsLoading(true)
    try {
      console.log("[v0] Creating time lock transaction...")
      console.log("[v0] Amount:", amount, "SOL")
      console.log("[v0] Unlock timestamp:", new Date(unlockTimestamp * 1000))
      console.log("[v0] Recipient:", recipient || "Self")

      deductDemoBalance(amount)

      const mockSignature = `demo_timelock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const lockData = {
        id: mockSignature,
        amount,
        unlockTimestamp,
        recipient: recipient || publicKey.toString(),
        creator: publicKey.toString(),
        status: "locked",
        createdAt: Date.now(),
      }

      const storageKey = `demo_timelocks_${publicKey.toString()}`
      const existingLocks = JSON.parse(localStorage.getItem(storageKey) || "[]")
      existingLocks.push(lockData)
      localStorage.setItem(storageKey, JSON.stringify(existingLocks))

      window.dispatchEvent(new CustomEvent("lockCreated"))

      console.log("[v0] Demo mode: SOL deducted from balance and lock created")
      console.log("[v0] Time lock created with ID:", mockSignature)
      return mockSignature
    } catch (error) {
      console.error("[v0] Failed to create time lock:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const withdrawFromLock = async (lockId: string) => {
    if (!publicKey) throw new Error("Wallet not connected")

    setIsLoading(true)
    try {
      console.log("[v0] Withdrawing from lock:", lockId)

      const storageKey = `demo_timelocks_${publicKey.toString()}`
      const existingLocks = JSON.parse(localStorage.getItem(storageKey) || "[]")
      const lockIndex = existingLocks.findIndex((lock: any) => lock.id === lockId)

      if (lockIndex === -1) {
        throw new Error("Lock not found")
      }

      const lock = existingLocks[lockIndex]
      const currentTime = Math.floor(Date.now() / 1000)

      if (currentTime < lock.unlockTimestamp) {
        const unlockDate = new Date(lock.unlockTimestamp * 1000)
        throw new Error(`Lock is still active. Unlock time: ${unlockDate.toLocaleString()}`)
      }

      if (lock.status !== "locked") {
        throw new Error("Lock has already been withdrawn")
      }

      addDemoBalance(lock.amount)

      existingLocks[lockIndex].status = "withdrawn"
      existingLocks[lockIndex].withdrawnAt = Date.now()
      localStorage.setItem(storageKey, JSON.stringify(existingLocks))

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const withdrawSignature = `withdraw_${lockId}_${Date.now()}`
      console.log("[v0] Successfully withdrawn from lock and SOL returned to balance:", withdrawSignature)
      return withdrawSignature
    } catch (error) {
      console.error("[v0] Failed to withdraw from lock:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createTimeLock,
    withdrawFromLock,
    isLoading,
  }
}
