"use client"

import { useRouter } from "next/navigation"
import MNZDInfoModal from "./mnzd-info-modal"

export default function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  return (
    <header className="space-y-3 border-b border-border pb-8">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight">✅ NEVER BREAK THE CHAIN</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mt-2">
            Minimum Non-Zero Day (MNZD) — Showing up daily, even on bad days.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-2xl leading-relaxed mt-2">
            Touch code. Think once. Use your voice. Move your body. All four must happen for a complete day. No exceptions.
            No substitutions.
          </p>
          <div className="mt-3">
            <MNZDInfoModal autoOpen={typeof window !== 'undefined' && localStorage.getItem('isNewUser') === 'true'} />
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-4 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted/50 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
