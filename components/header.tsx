"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { logout } from "@/lib/auth-utils"
import MNZDInfoModal from "./mnzd-info-modal"

export default function Header() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  // Get user name from custom auth
  useEffect(() => {
    const getUserName = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          setUserName(userData.name || userData.email)
        }
      } catch (error) {
        // console.log('Error fetching user data:', error)
      }
    }
    
    getUserName()
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="space-y-3 border-b border-slate-200 dark:border-slate-700 pb-8">
      {/* Mobile: Top bar with logout and welcome */}
      <div className="flex sm:hidden justify-end items-center mb-4 relative">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 absolute left-1/2 transform -translate-x-1/2">
          Welcome, {userName}
        </span>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Logout
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent tracking-tight">
            🔗 NEVER BREAK THE CHAIN
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 sm:max-w-xl mt-2">
            Minimum Non-Zero Day (MNZD) — Showing up daily, even on bad days.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500 sm:max-w-2xl leading-relaxed mt-2">
            Code. Think. Express. Move. All four must happen for a complete day. No exceptions. No substitutions.
          </p>
          <div className="mt-3 flex justify-center sm:justify-start">
            <MNZDInfoModal autoOpen={false} />
          </div>
        </div>
        
        {/* Desktop: Right side with welcome and logout */}
        <div className="hidden sm:flex items-center gap-3 ml-4">
          {userName && (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Welcome, {userName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
