"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { logout } from "@/lib/auth-utils"
import { Link2, User, LogOut, Settings } from "lucide-react"
import ProfileSettingsModal from "./profile-settings-modal"

export default function Header() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUserName = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const userData = await response.json()
          setUserName(userData.name || userData.email)
        }
      } catch (error) {
        // Silent error
      }
    }
    getUserName()
  }, [showProfileModal])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  const handleProfileSettings = () => {
    setShowUserMenu(false)
    setShowProfileModal(true)
  }

  return (
    <>
      <header className="flex items-center justify-between py-4 mb-6">
        <div className="flex items-center gap-3">
          <Link2 className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Never Break The Chain
          </h1>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white dark:text-slate-800" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
              {userName ? userName.split('@')[0] : 'User'}
            </span>
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chain Builder
                </p>
              </div>
              <button 
                onClick={handleProfileSettings}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <ProfileSettingsModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  )
}
