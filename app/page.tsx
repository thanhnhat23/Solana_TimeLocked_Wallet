import { WalletProvider } from "@/components/wallet-provider"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <WalletProvider>
      <main className="min-h-screen bg-background">
        <Dashboard />
      </main>
    </WalletProvider>
  )
}
