"use client"

import { useConnection } from "@solana/wallet-adapter-react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"
import { useState, useEffect } from "react"

export function NetworkStatus() {
  const { connection } = useConnection()
  const [network, setNetwork] = useState<string>("devnet")
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const endpoint = connection.rpcEndpoint
        if (endpoint.includes("devnet")) {
          setNetwork("devnet")
        } else if (endpoint.includes("mainnet")) {
          setNetwork("mainnet-beta")
        } else if (endpoint.includes("testnet")) {
          setNetwork("testnet")
        } else {
          setNetwork("localhost")
        }

        // Test connection
        await connection.getLatestBlockhash()
        setIsConnected(true)
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [connection])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {network}
      </Badge>
    </div>
  )
}
